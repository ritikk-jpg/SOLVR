import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { FoodRescueStateMachine } from '../services/stateMachines';
import { FoodRescue, CivicTask } from '../db/schema';

export const foodRescueRouter = Router();

/**
 * GET /api/food-rescues
 */
foodRescueRouter.get('/', (req: Request, res: Response) => {
  const { status, donorId, category } = req.query;

  let rescues = Array.from(db.foodRescues.values());

  if (status) {
    rescues = rescues.filter((r) => r.status === status);
  }
  if (donorId) {
    rescues = rescues.filter((r) => r.donorId === donorId);
  }
  if (category) {
    rescues = rescues.filter((r) => r.foodCategory === category);
  }

  rescues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    count: rescues.length,
    data: rescues,
  });
});

/**
 * GET /api/food-rescues/:id
 */
foodRescueRouter.get('/:id', (req: Request, res: Response) => {
  const rescue = db.foodRescues.get(req.params.id);
  if (!rescue) {
    return res.status(404).json({ success: false, error: 'Food rescue record not found' });
  }

  res.json({
    success: true,
    data: rescue,
  });
});

/**
 * POST /api/food-rescues
 * Donor registers surplus perishable food batch in Delhi
 */
foodRescueRouter.post('/', (req: Request, res: Response) => {
  const {
    donorId = 'USR-DONOR-01',
    donorName = 'Royal Dawat Banquets & Catering (Chattarpur)',
    donorType = 'Banquet & Event Caterer',
    foodCategory = 'cooked_meals',
    itemsSummary,
    estimatedWeightKg = 35,
    estimatedWeightLbs,
    temperatureRequired = 'hot',
    pickupWindowMinutes = 45,
    pickupAddress = 'Silver Oak Farm Road, Chattarpur Mandir Lane',
    destinationShelterName = 'DUSIB Rain Basera (Night Shelter #18)',
    destinationAddress = 'Near Sarai Kale Khan ISBT Terminal',
    district = 'South Delhi (Hauz Khas & Saket)',
    coordinates,
  } = req.body;

  if (!itemsSummary) {
    return res.status(400).json({ success: false, error: 'Missing itemsSummary' });
  }

  const id = `RESCUE-${Math.floor(Math.random() * 900) + 200}`;
  const weight = estimatedWeightKg || (estimatedWeightLbs ? Math.round(estimatedWeightLbs * 0.453592) : 35);
  const baseBountyInr = Math.max(450, Math.round(weight * 12 + 250));

  const newRescue: FoodRescue = {
    id,
    donorId,
    donorName,
    donorType,
    foodCategory,
    itemsSummary,
    estimatedWeightKg: weight,
    temperatureRequired,
    pickupWindowExpires: new Date(Date.now() + pickupWindowMinutes * 60000).toISOString(),
    pickupAddress,
    destinationShelterId: 'SHLTR-DUSIB-18',
    destinationShelterName,
    destinationAddress,
    district,
    coordinates: coordinates || {
      lat: 28.502,
      lng: 77.185,
      mapX: Math.floor(Math.random() * 30) + 35,
      mapY: Math.floor(Math.random() * 30) + 40,
    },
    baseBountyInr,
    status: 'AVAILABLE',
    assignedWorkerId: null,
    chainOfCustody: [
      {
        event: 'BATCH_LOGGED',
        timestamp: new Date().toISOString(),
        actorId: donorId,
        actorName: donorName,
        notes: `Surplus food batch recorded. FSSAI hygiene certificate active.`,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.foodRescues.set(newRescue.id, newRescue);

  // Synchronously spawn a matching CivicTask so workers can immediately see and claim it
  const matchingCivicTask: CivicTask = {
    id: `TASK-F-${newRescue.id.replace('RESCUE-', '')}`,
    type: 'food_rescue',
    title: itemsSummary,
    description: `${weight} kg surplus from ${donorName}. Transport to ${destinationShelterName}.`,
    urgency: pickupWindowMinutes <= 45 ? 'critical' : 'priority',
    status: 'PENDING',
    district,
    address: pickupAddress,
    coordinates: newRescue.coordinates,
    baseBountyInr,
    estimatedMinutes: 30,
    distanceKm: 2.8,
    equipmentRequired: ['Insulated Food Carrier Box', 'Two-Wheeler Cargo Straps'],
    reportedBy: donorName,
    assignedWorkerId: null,
    escrowStatus: 'BONDED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.tasks.set(matchingCivicTask.id, matchingCivicTask);

  db.logAudit('FOOD_RESCUE', newRescue.id, 'BATCH_LOGGED', donorId, {
    weightKg: weight,
    baseBountyInr,
  });

  res.status(201).json({
    success: true,
    data: newRescue,
    createdTaskId: matchingCivicTask.id,
  });
});

/**
 * POST /api/food-rescues/:id/claim
 */
foodRescueRouter.post('/:id/claim', (req: Request, res: Response) => {
  const { workerId = 'DL-SOLV-42' } = req.body;
  try {
    const updated = FoodRescueStateMachine.claimRescue(req.params.id, workerId);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/food-rescues/:id/pickup
 */
foodRescueRouter.post('/:id/pickup', (req: Request, res: Response) => {
  const { workerId = 'DL-SOLV-42', temperatureC } = req.body;
  try {
    const updated = FoodRescueStateMachine.pickupRescue(req.params.id, workerId, temperatureC);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/food-rescues/:id/deliver
 */
foodRescueRouter.post('/:id/deliver', (req: Request, res: Response) => {
  const { staffName = 'Inspector Suresh (DUSIB Shelter In-Charge)' } = req.body;
  try {
    const updated = FoodRescueStateMachine.deliverRescue(req.params.id, staffName);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
