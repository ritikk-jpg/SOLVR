import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { GamificationAndPayoutEngine } from '../services/stateMachines';

export const walletRouter = Router();

/**
 * GET /api/wallets/:id
 */
walletRouter.get('/:id', (req: Request, res: Response) => {
  let wallet = db.wallets.get(req.params.id);

  // If not found by wallet id, try by worker id
  if (!wallet) {
    for (const w of db.wallets.values()) {
      if (w.workerId === req.params.id || w.userId === req.params.id) {
        wallet = w;
        break;
      }
    }
  }

  if (!wallet) {
    return res.status(404).json({ success: false, error: 'Wallet not found' });
  }

  res.json({
    success: true,
    data: {
      ...wallet,
      balanceFormatted: `₹${wallet.balanceInr.toLocaleString('en-IN')}`,
      pendingPayoutFormatted: `₹${wallet.pendingPayoutInr.toLocaleString('en-IN')}`,
      lifetimeEarnedFormatted: `₹${wallet.lifetimeEarnedInr.toLocaleString('en-IN')}`,
    },
  });
});

/**
 * GET /api/wallets/:id/transactions
 */
walletRouter.get('/:id/transactions', (req: Request, res: Response) => {
  let wallet = db.wallets.get(req.params.id);
  if (!wallet) {
    for (const w of db.wallets.values()) {
      if (w.workerId === req.params.id || w.userId === req.params.id) {
        wallet = w;
        break;
      }
    }
  }

  if (!wallet) {
    return res.status(404).json({ success: false, error: 'Wallet not found' });
  }

  const txns = Array.from(db.transactions.values()).filter(
    (tx) => tx.walletId === wallet!.id
  );

  txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    count: txns.length,
    data: txns.map((t) => ({
      ...t,
      amountFormatted: `₹${t.amountInr.toLocaleString('en-IN')}`,
    })),
  });
});

/**
 * POST /api/wallets/:id/payout
 * Simulate or process scheduled weekly payout cycle via UPI Rails
 */
walletRouter.post('/:id/payout', (req: Request, res: Response) => {
  let wallet = db.wallets.get(req.params.id);
  if (!wallet) {
    for (const w of db.wallets.values()) {
      if (w.workerId === req.params.id || w.userId === req.params.id) {
        wallet = w;
        break;
      }
    }
  }

  if (!wallet) {
    return res.status(404).json({ success: false, error: 'Wallet not found' });
  }

  try {
    const result = GamificationAndPayoutEngine.processScheduledPayoutCycle(wallet.id);
    res.json({
      success: true,
      message: `Weekly scheduled cycle processed via instant UPI transfer to ${wallet.payoutMethod.upiId}.`,
      data: {
        disbursedInr: result.disbursedInr,
        disbursedFormatted: `₹${result.disbursedInr.toLocaleString('en-IN')}`,
        transaction: result.transaction,
        remainingPendingInr: 0,
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
