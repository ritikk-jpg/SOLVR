/**
 * State Machines & Business Logic Engines for SOLVR Delhi (NCT of Delhi, India)
 * Enforces legal state transitions, MCD escrow locks, FSSAI chain-of-custody, and UPI payout calculations.
 */

import { db } from '../db/store';
import { 
  TaskStatus, 
  CivicTask, 
  FoodRescue, 
  FoodRescueStatus, 
  Worker, 
  Wallet, 
  Transaction 
} from '../db/schema';

export class TaskStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskStateTransitionError';
  }
}

// Legal State Transition Matrix
const LEGAL_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'PENDING', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'ASSIGNED', 'CANCELLED'],
  SUBMITTED: ['VERIFIED', 'IN_PROGRESS'],
  VERIFIED: [], // Terminal
  CANCELLED: [], // Terminal
};

export class TaskStateMachine {
  /**
   * Assign task to worker
   */
  public static assignTask(taskId: string, workerId: string): CivicTask {
    const task = db.tasks.get(taskId);
    if (!task) throw new TaskStateTransitionError(`Task ${taskId} not found.`);

    if (!LEGAL_TASK_TRANSITIONS[task.status].includes('ASSIGNED')) {
      throw new TaskStateTransitionError(
        `Illegal transition: Cannot assign task in ${task.status} status.`
      );
    }

    const worker = db.workers.get(workerId);
    if (!worker) throw new TaskStateTransitionError(`Worker ${workerId} not found.`);

    if (worker.activeTaskId && worker.activeTaskId !== taskId) {
      throw new TaskStateTransitionError(
        `Worker ${worker.callsign} already has an active task assigned (${worker.activeTaskId}).`
      );
    }

    // Mutate state
    task.status = 'ASSIGNED';
    task.assignedWorkerId = workerId;
    task.updatedAt = new Date().toISOString();

    worker.activeTaskId = taskId;
    worker.currentStatus = 'on_route';

    db.logAudit('TASK', taskId, 'TASK_ASSIGNED', workerId, {
      workerCallsign: worker.callsign,
      bountyInr: task.baseBountyInr,
    });

    return task;
  }

  /**
   * Worker checks in on site and starts work
   */
  public static startTask(taskId: string, workerId: string): CivicTask {
    const task = db.tasks.get(taskId);
    if (!task) throw new TaskStateTransitionError(`Task ${taskId} not found.`);

    if (task.assignedWorkerId !== workerId) {
      throw new TaskStateTransitionError(`Worker ${workerId} is not assigned to task ${taskId}.`);
    }

    if (!LEGAL_TASK_TRANSITIONS[task.status].includes('IN_PROGRESS')) {
      throw new TaskStateTransitionError(`Illegal transition to IN_PROGRESS from ${task.status}.`);
    }

    task.status = 'IN_PROGRESS';
    task.updatedAt = new Date().toISOString();

    const worker = db.workers.get(workerId);
    if (worker) {
      worker.currentStatus = 'busy';
    }

    db.logAudit('TASK', taskId, 'TASK_STARTED', workerId, { status: 'IN_PROGRESS' });
    return task;
  }

  /**
   * Worker submits completion proof
   */
  public static submitProof(
    taskId: string,
    workerId: string,
    proof: { notes: string; beforePhotoUrl?: string; afterPhotoUrl?: string; verifiedWeightKg?: number; verifiedWeightLbs?: number }
  ): { task: CivicTask; calculatedPayoutInr: number } {
    const task = db.tasks.get(taskId);
    if (!task) throw new TaskStateTransitionError(`Task ${taskId} not found.`);

    if (task.assignedWorkerId !== workerId) {
      throw new TaskStateTransitionError(`Worker ${workerId} is not assigned to task ${taskId}.`);
    }

    if (task.status !== 'IN_PROGRESS' && task.status !== 'ASSIGNED') {
      throw new TaskStateTransitionError(`Cannot submit proof for task in ${task.status} status.`);
    }

    const worker = db.workers.get(workerId);
    if (!worker) throw new TaskStateTransitionError(`Worker ${workerId} not found.`);

    const weightKg = proof.verifiedWeightKg || (proof.verifiedWeightLbs ? Math.round(proof.verifiedWeightLbs * 0.453592) : undefined);

    task.status = 'SUBMITTED';
    task.proofSubmission = {
      workerId,
      submittedAt: new Date().toISOString(),
      notes: proof.notes,
      beforePhotoUrl: proof.beforePhotoUrl,
      afterPhotoUrl: proof.afterPhotoUrl,
      gpsVerified: true,
      verifiedWeightKg: weightKg,
    };
    task.updatedAt = new Date().toISOString();

    // Calculate reward bonus with worker streak multiplier in INR
    const streakBonusInr = Math.round(
      task.baseBountyInr * (worker.streakMultiplier - 1)
    );
    const totalPayoutInr = task.baseBountyInr + streakBonusInr;

    // Immediately credit pending wallet balance
    GamificationAndPayoutEngine.creditWorkerPendingPayout(
      workerId,
      taskId,
      totalPayoutInr,
      `Completion of ${task.title}`
    );

    // Update worker stats
    worker.totalTasksCompleted += 1;
    worker.tierScore = Math.min(100, worker.tierScore + 4);
    worker.activeTaskId = null;
    worker.currentStatus = 'available';

    if (weightKg) {
      worker.totalFoodRescuedKg += weightKg;
      worker.carbonOffsetKg += Math.round(weightKg * 1.35);
    }

    db.logAudit('TASK', taskId, 'PROOF_SUBMITTED', workerId, {
      totalPayoutInr,
      streakMultiplier: worker.streakMultiplier,
    });

    return { task, calculatedPayoutInr: totalPayoutInr };
  }

  /**
   * Dispatcher verifies proof and releases escrow
   */
  public static verifyTask(taskId: string, dispatcherId: string): CivicTask {
    const task = db.tasks.get(taskId);
    if (!task) throw new TaskStateTransitionError(`Task ${taskId} not found.`);

    if (task.status !== 'SUBMITTED') {
      throw new TaskStateTransitionError(
        `Cannot verify task in ${task.status} status (must be SUBMITTED).`
      );
    }

    task.status = 'VERIFIED';
    task.escrowStatus = 'DISBURSED';
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();

    if (task.proofSubmission) {
      task.proofSubmission.verifiedBy = dispatcherId;
      task.proofSubmission.verifiedAt = new Date().toISOString();
    }

    db.logAudit('DISPATCH', taskId, 'PROOF_VERIFIED_ESCROW_RELEASED', dispatcherId, {
      bountyInr: task.baseBountyInr,
      assignedWorkerId: task.assignedWorkerId,
    });

    return task;
  }
}

// Chain of Custody Transitions for Food Rescue
const LEGAL_RESCUE_TRANSITIONS: Record<FoodRescueStatus, FoodRescueStatus[]> = {
  AVAILABLE: ['CLAIMED', 'EXPIRED'],
  CLAIMED: ['PICKED_UP', 'AVAILABLE', 'EXPIRED'],
  PICKED_UP: ['DELIVERED_VERIFIED', 'EXPIRED'],
  DELIVERED_VERIFIED: [], // Terminal
  EXPIRED: [], // Terminal
};

export class FoodRescueStateMachine {
  public static claimRescue(rescueId: string, workerId: string): FoodRescue {
    const rescue = db.foodRescues.get(rescueId);
    if (!rescue) throw new Error(`Rescue ${rescueId} not found.`);

    if (!LEGAL_RESCUE_TRANSITIONS[rescue.status].includes('CLAIMED')) {
      throw new Error(`Cannot claim rescue in ${rescue.status} status.`);
    }

    rescue.status = 'CLAIMED';
    rescue.assignedWorkerId = workerId;
    rescue.updatedAt = new Date().toISOString();

    rescue.chainOfCustody.push({
      event: 'COURIER_ASSIGNED',
      timestamp: new Date().toISOString(),
      actorId: workerId,
      actorName: 'DL-SOLV-42 Courier Unit',
      notes: `Courier assigned for temperature-regulated transit.`,
    });

    db.logAudit('FOOD_RESCUE', rescueId, 'RESCUE_CLAIMED', workerId);
    return rescue;
  }

  public static pickupRescue(rescueId: string, workerId: string, temperatureC?: number): FoodRescue {
    const rescue = db.foodRescues.get(rescueId);
    if (!rescue) throw new Error(`Rescue ${rescueId} not found.`);

    if (rescue.status !== 'CLAIMED') {
      throw new Error(`Cannot pickup rescue in ${rescue.status} status.`);
    }

    rescue.status = 'PICKED_UP';
    rescue.updatedAt = new Date().toISOString();

    rescue.chainOfCustody.push({
      event: 'KITCHEN_PICKUP',
      timestamp: new Date().toISOString(),
      actorId: workerId,
      actorName: 'Courier Unit',
      notes: `Inspected at donor kitchen. Packaged in compliant thermal containers.`,
      temperatureReadingC: temperatureC,
    });

    db.logAudit('FOOD_RESCUE', rescueId, 'RESCUE_PICKED_UP', workerId, { temperatureC });
    return rescue;
  }

  public static deliverRescue(rescueId: string, staffName: string): FoodRescue {
    const rescue = db.foodRescues.get(rescueId);
    if (!rescue) throw new Error(`Rescue ${rescueId} not found.`);

    if (rescue.status !== 'PICKED_UP') {
      throw new Error(`Cannot deliver rescue in ${rescue.status} status.`);
    }

    rescue.status = 'DELIVERED_VERIFIED';
    rescue.updatedAt = new Date().toISOString();
    rescue.donorTaxCertificateId = `CERT-SEC80G-${rescue.id}-${Date.now()}`;

    rescue.chainOfCustody.push({
      event: 'SHELTER_DELIVERY',
      timestamp: new Date().toISOString(),
      actorId: 'SHELTER-STAFF',
      actorName: staffName,
      notes: `Received at ${rescue.destinationShelterName} in good condition. Section 80G tax receipt authenticated.`,
    });

    db.logAudit('FOOD_RESCUE', rescueId, 'RESCUE_DELIVERED_VERIFIED', 'SHELTER-STAFF', {
      taxCertificateId: rescue.donorTaxCertificateId,
      weightKg: rescue.estimatedWeightKg,
    });

    return rescue;
  }
}

export class GamificationAndPayoutEngine {
  /**
   * Credit worker wallet with pending task bounty and streak bonus in INR
   */
  public static creditWorkerPendingPayout(
    workerId: string,
    taskId: string,
    amountInr: number,
    description: string
  ): Transaction {
    // Find wallet by workerId
    let wallet: Wallet | undefined;
    for (const w of db.wallets.values()) {
      if (w.workerId === workerId) {
        wallet = w;
        break;
      }
    }

    if (!wallet) {
      throw new Error(`Wallet not found for worker ${workerId}`);
    }

    wallet.balanceInr += amountInr;
    wallet.pendingPayoutInr += amountInr;
    wallet.lifetimeEarnedInr += amountInr;
    wallet.updatedAt = new Date().toISOString();

    const txn: Transaction = {
      id: `TXN-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`,
      walletId: wallet.id,
      type: 'TASK_BOUNTY',
      amountInr,
      status: 'PENDING',
      referenceTaskId: taskId,
      description,
      paymentMode: 'UPI',
      createdAt: new Date().toISOString(),
    };

    db.transactions.set(txn.id, txn);
    return txn;
  }

  /**
   * Process scheduled weekly payout cycle via UPI Rails
   */
  public static processScheduledPayoutCycle(walletId: string): {
    disbursedInr: number;
    transaction: Transaction;
  } {
    const wallet = db.wallets.get(walletId);
    if (!wallet) throw new Error(`Wallet ${walletId} not found.`);

    const disbursedInr = wallet.pendingPayoutInr;
    if (disbursedInr <= 0) {
      throw new Error(`Wallet has no pending earnings to disburse.`);
    }

    wallet.balanceInr = 0;
    wallet.pendingPayoutInr = 0;
    wallet.updatedAt = new Date().toISOString();

    // Mark pending transactions as CLEARED
    for (const tx of db.transactions.values()) {
      if (tx.walletId === walletId && tx.status === 'PENDING') {
        tx.status = 'CLEARED';
      }
    }

    const disbursementTxn: Transaction = {
      id: `PAYOUT-UPI-${Date.now()}`,
      walletId,
      type: 'SCHEDULED_PAYOUT',
      amountInr: disbursedInr,
      status: 'CLEARED',
      description: `Instant UPI transfer to ${wallet.payoutMethod.upiId}`,
      paymentMode: 'UPI',
      createdAt: new Date().toISOString(),
    };

    db.transactions.set(disbursementTxn.id, disbursementTxn);
    db.logAudit('WALLET', walletId, 'SCHEDULED_PAYOUT_DISBURSED', 'UPI_RAILS', {
      disbursedInr,
      upiId: wallet.payoutMethod.upiId,
    });

    return { disbursedInr, transaction: disbursementTxn };
  }
}
