import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { TaskStateMachine, TaskStateTransitionError } from '../services/stateMachines';
import { CivicTask } from '../db/schema';

export const taskRouter = Router();

/**
 * GET /api/tasks
 * Query parameters: status, district, urgency, type, workerId
 */
taskRouter.get('/', (req: Request, res: Response) => {
  const { status, district, urgency, type, workerId } = req.query;

  let tasks = Array.from(db.tasks.values());

  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (district) {
    tasks = tasks.filter((t) => t.district.toLowerCase() === (district as string).toLowerCase());
  }
  if (urgency) {
    tasks = tasks.filter((t) => t.urgency === urgency);
  }
  if (type) {
    tasks = tasks.filter((t) => t.type === type);
  }
  if (workerId) {
    tasks = tasks.filter((t) => t.assignedWorkerId === workerId);
  }

  // Sort by created descending
  tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

/**
 * GET /api/tasks/:id
 */
taskRouter.get('/:id', (req: Request, res: Response) => {
  const task = db.tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  // Also include audit logs for this task
  const auditTrail = db.auditLogs.filter((log) => log.entityId === task.id);

  res.json({
    success: true,
    data: {
      ...task,
      auditTrail,
    },
  });
});

/**
 * POST /api/tasks
 * Create a new civic maintenance micro-task in Delhi
 */
taskRouter.post('/', (req: Request, res: Response) => {
  const {
    title,
    description,
    type = 'civic_repair',
    civicCategory,
    urgency = 'normal',
    district = 'Central Delhi (Connaught Place)',
    address,
    coordinates,
    baseBountyInr = 800,
    baseBounty,
    estimatedMinutes = 30,
    equipmentRequired = [],
    reportedBy = 'MCD Control Room Dispatch',
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title, description',
    });
  }

  const id = `TASK-${Math.floor(Math.random() * 900) + 100}`;
  const effectiveBounty = baseBountyInr || baseBounty || 800;

  const newTask: CivicTask = {
    id,
    type,
    title,
    description,
    civicCategory,
    urgency,
    status: 'PENDING',
    district,
    address: address || `${district} Municipal Sector`,
    coordinates: coordinates || {
      lat: 28.6139,
      lng: 77.2090,
      mapX: Math.floor(Math.random() * 50) + 25,
      mapY: Math.floor(Math.random() * 50) + 25,
    },
    baseBountyInr: effectiveBounty,
    estimatedMinutes,
    distanceKm: 2.4,
    equipmentRequired,
    reportedBy,
    assignedWorkerId: null,
    escrowStatus: 'BONDED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks.set(newTask.id, newTask);
  db.logAudit('TASK', newTask.id, 'TASK_CREATED', reportedBy, {
    baseBountyInr: effectiveBounty,
    urgency,
  });

  res.status(201).json({
    success: true,
    data: newTask,
  });
});

/**
 * POST /api/tasks/:id/assign
 * Claim or assign task to worker
 */
taskRouter.post('/:id/assign', (req: Request, res: Response) => {
  const { workerId = 'DL-SOLV-42' } = req.body;
  try {
    const updatedTask = TaskStateMachine.assignTask(req.params.id, workerId);
    res.json({ success: true, data: updatedTask });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/tasks/:id/start
 * Check in on-site and begin work
 */
taskRouter.post('/:id/start', (req: Request, res: Response) => {
  const { workerId = 'DL-SOLV-42' } = req.body;
  try {
    const updatedTask = TaskStateMachine.startTask(req.params.id, workerId);
    res.json({ success: true, data: updatedTask });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/tasks/:id/submit-proof
 * Submit completion evidence
 */
taskRouter.post('/:id/submit-proof', (req: Request, res: Response) => {
  const {
    workerId = 'DL-SOLV-42',
    notes,
    beforePhotoUrl,
    afterPhotoUrl,
    verifiedWeightKg,
    verifiedWeightLbs,
  } = req.body;

  if (!notes) {
    return res.status(400).json({ success: false, error: 'Verification notes required.' });
  }

  try {
    const result = TaskStateMachine.submitProof(req.params.id, workerId, {
      notes,
      beforePhotoUrl,
      afterPhotoUrl,
      verifiedWeightKg,
      verifiedWeightLbs,
    });
    res.json({ success: true, data: result.task, calculatedPayoutInr: result.calculatedPayoutInr });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/tasks/:id/verify
 * Municipal dispatch verifies task and releases escrow
 */
taskRouter.post('/:id/verify', (req: Request, res: Response) => {
  const { dispatcherId = 'USR-DISPATCH' } = req.body;
  try {
    const verifiedTask = TaskStateMachine.verifyTask(req.params.id, dispatcherId);
    res.json({ success: true, data: verifiedTask });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
