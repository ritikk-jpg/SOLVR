import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { GoogleMapsService, LatLng } from '../services/googleMaps';

export const dispatchRouter = Router();

/**
 * POST /api/dispatch/match-workers
 * Geospatial Dispatch Engine: Matches a task with the closest available field workers
 * using Google Maps Distance Matrix API across Delhi NCT.
 */
dispatchRouter.post('/match-workers', async (req: Request, res: Response) => {
  const { taskId, coordinates } = req.body;

  let targetLat: number;
  let targetLng: number;
  let targetTitle = 'Incident Location';

  if (taskId) {
    const task = db.tasks.get(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    targetLat = task.coordinates.lat;
    targetLng = task.coordinates.lng;
    targetTitle = task.title;
  } else if (coordinates?.lat && coordinates?.lng) {
    targetLat = coordinates.lat;
    targetLng = coordinates.lng;
  } else {
    targetLat = 28.6139;
    targetLng = 77.2090;
  }

  // Get available workers
  const availableWorkers = Array.from(db.workers.values()).filter(
    (w) => w.currentStatus === 'available' || w.currentStatus === 'on_route'
  );

  if (availableWorkers.length === 0) {
    return res.json({
      success: true,
      message: 'No active workers currently online in the Delhi district.',
      data: [],
    });
  }

  // Build origins and destinations for Distance Matrix
  const origins: LatLng[] = availableWorkers.map((w) => ({
    latitude: w.currentLocation.lat,
    longitude: w.currentLocation.lng,
  }));

  const destinations: LatLng[] = [
    {
      latitude: targetLat,
      longitude: targetLng,
    },
  ];

  const matrix = await GoogleMapsService.computeDistanceMatrix(origins, destinations, 'DRIVE');

  // Match matrix results to workers and sort by ETA
  const matches = availableWorkers.map((worker, index) => {
    const matrixItem = matrix.find((m) => m.originIndex === index) || {
      distanceMeters: 2400,
      durationSeconds: 420,
    };

    const distanceKm = Math.round((matrixItem.distanceMeters / 1000) * 10) / 10;
    const durationMinutes = Math.round(matrixItem.durationSeconds / 60);

    return {
      workerId: worker.id,
      callsign: worker.callsign,
      name: worker.callsign === 'DL-SOLV-42' ? 'Aarav Sharma' : worker.callsign === 'DL-SOLV-09' ? 'Pooja Verma' : 'Delhi Civic Unit',
      tier: worker.tier,
      reputation: worker.reputationRating,
      streakMultiplier: worker.streakMultiplier,
      distanceKm,
      durationMinutes,
      currentDistrict: worker.currentLocation.district,
      recommended: index === 0,
    };
  });

  matches.sort((a, b) => a.durationMinutes - b.durationMinutes);

  db.logAudit('DISPATCH', taskId || 'GEO-MATCH', 'WORKERS_MATCHED', 'MCD_DISPATCH_CAD', {
    targetTitle,
    candidatesEvaluated: matches.length,
    closestEtaMinutes: matches[0]?.durationMinutes,
  });

  res.json({
    success: true,
    data: {
      target: { title: targetTitle, lat: targetLat, lng: targetLng },
      rankedWorkers: matches,
    },
  });
});

/**
 * POST /api/dispatch/route-optimize
 * Calculates multi-stop route optimization for Delhi food rescue pickups and multi-dropoffs
 */
dispatchRouter.post('/route-optimize', async (req: Request, res: Response) => {
  const { origin, destination, intermediates = [], travelMode = 'DRIVE' } = req.body;

  if (!origin?.latitude || !destination?.latitude) {
    return res.status(400).json({
      success: false,
      error: 'Missing origin or destination coordinates { latitude, longitude }',
    });
  }

  const result = await GoogleMapsService.computeOptimizedRoute(
    origin,
    destination,
    intermediates,
    travelMode
  );

  const totalKm = Math.round((result.distanceMeters / 1000) * 10) / 10;
  const totalMinutes = Math.round(result.durationSeconds / 60);

  res.json({
    success: true,
    data: {
      totalKm,
      totalMinutes,
      totalMeters: result.distanceMeters,
      totalSeconds: result.durationSeconds,
      legsCount: result.legs.length,
      isSimulatedFallback: result.isSimulatedFallback,
      waypointOrder: result.waypointOrder,
      legs: result.legs.map((leg) => ({
        distanceKm: Math.round((leg.distanceMeters / 1000) * 10) / 10,
        durationMinutes: Math.round(leg.durationSeconds / 60),
      })),
    },
  });
});

/**
 * POST /api/dispatch/geofence-verify
 * Checks worker real-time GPS coordinate against the task's location before release in Delhi
 */
dispatchRouter.post('/geofence-verify', (req: Request, res: Response) => {
  const { workerId, taskId, currentLat, currentLng } = req.body;

  const task = db.tasks.get(taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const worker = db.workers.get(workerId);
  const wLat = currentLat ?? (worker ? worker.currentLocation.lat : 28.6139);
  const wLng = currentLng ?? (worker ? worker.currentLocation.lng : 77.2090);

  const verification = GoogleMapsService.verifyGeofence(
    wLat,
    wLng,
    task.coordinates.lat,
    task.coordinates.lng,
    250 // 250 meters geofence radius
  );

  db.logAudit('TASK', taskId, 'GEOFENCE_CHECK', workerId || 'SYSTEM', {
    withinGeofence: verification.withinGeofence,
    distanceMeters: verification.distanceMeters,
  });

  res.json({
    success: true,
    data: {
      taskId,
      workerId,
      ...verification,
    },
  });
});

/**
 * GET /api/dispatch/shelters-nearby
 * Finds nearby shelters/pantries in Delhi using Places API
 */
dispatchRouter.get('/shelters-nearby', async (req: Request, res: Response) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 28.6139;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : 77.2090;

  const places = await GoogleMapsService.searchPlacesNearby('DUSIB rain basera shelter community kitchen delhi', {
    latitude: lat,
    longitude: lng,
  });

  res.json({
    success: true,
    count: places.length,
    data: places,
  });
});
