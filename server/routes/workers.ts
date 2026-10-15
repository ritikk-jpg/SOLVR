import { Router, Request, Response } from 'express';
import { db } from '../db/store';

export const workerRouter = Router();

/**
 * GET /api/workers/:id
 */
workerRouter.get('/:id', (req: Request, res: Response) => {
  const worker = db.workers.get(req.params.id);
  if (!worker) {
    return res.status(404).json({ success: false, error: 'Worker not found' });
  }

  const user = db.users.get(worker.userId);
  const badges = db.badges.get(worker.id) || [];

  res.json({
    success: true,
    data: {
      ...worker,
      user,
      badges,
    },
  });
});

/**
 * GET /api/workers/:id/gamification
 * Detailed gamification breakdown: streak multiplier, tier calculation, milestones
 */
workerRouter.get('/:id/gamification', (req: Request, res: Response) => {
  const worker = db.workers.get(req.params.id);
  if (!worker) {
    return res.status(404).json({ success: false, error: 'Worker not found' });
  }

  const badges = db.badges.get(worker.id) || [];

  const tierProgression = {
    currentTier: worker.tier,
    tierScore: worker.tierScore,
    nextTier: worker.tier === 'cadet' ? 'guardian' : worker.tier === 'guardian' ? 'coordinator' : 'max',
    requiredTasksToNextTier: Math.max(0, 75 - worker.totalTasksCompleted),
  };

  const streakEngine = {
    activeStreakDays: worker.activeStreakDays,
    multiplier: worker.streakMultiplier,
    nextMilestoneDays: 14,
    nextMultiplier: 1.45,
    streakProtectionActive: true,
  };

  res.json({
    success: true,
    data: {
      workerId: worker.id,
      callsign: worker.callsign,
      tierProgression,
      streakEngine,
      badges,
      impact: {
        totalTasksCompleted: worker.totalTasksCompleted,
        totalFoodRescuedKg: worker.totalFoodRescuedKg,
        estimatedMealsServed: Math.round(worker.totalFoodRescuedKg * 2.2),
        carbonOffsetKg: worker.carbonOffsetKg,
      },
    },
  });
});

/**
 * POST /api/workers/:id/location
 * Update worker GPS location
 */
workerRouter.post('/:id/location', (req: Request, res: Response) => {
  const worker = db.workers.get(req.params.id);
  if (!worker) {
    return res.status(404).json({ success: false, error: 'Worker not found' });
  }

  const { district, lat, lng, mapX, mapY } = req.body;
  if (district) worker.currentLocation.district = district;
  if (lat) worker.currentLocation.lat = lat;
  if (lng) worker.currentLocation.lng = lng;
  if (mapX) worker.currentLocation.mapX = mapX;
  if (mapY) worker.currentLocation.mapY = mapY;

  res.json({
    success: true,
    data: worker.currentLocation,
  });
});
