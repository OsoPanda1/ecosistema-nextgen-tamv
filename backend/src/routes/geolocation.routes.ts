/**
 * Geolocation Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as geolocationController from '../controllers/geolocation.controller';

const router = Router();

const placeRegistrationSchema = z.object({
  name: z.string().min(2).max(160),
  kind: z.enum(['business', 'stall', 'poi']),
  category: z.string().min(2).max(100),
  address: z.string().max(240).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).max(5000).optional(),
  source: z.enum(['gps', 'wifi', 'beacon', 'manual']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const telemetrySchema = z.object({
  sessionId: z.string().uuid().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  source: z.enum(['gps', 'wifi', 'beacon', 'manual']),
  accuracyMeters: z.number().min(0).max(5000).optional(),
  speedKmh: z.number().min(0).max(500).optional(),
  headingDeg: z.number().min(0).max(360).optional(),
  observedAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const nearbyQuerySchema = z.object({
  lat: z.string(),
  lng: z.string(),
  radiusMeters: z.string().optional(),
});

router.post('/places/register', requireAuth, validateBody(placeRegistrationSchema), geolocationController.registerPlaceHandler);
router.post('/telemetry/ingest', optionalAuth, validateBody(telemetrySchema), geolocationController.ingestTelemetryHandler);
router.get('/places/nearby', validateQuery(nearbyQuerySchema), geolocationController.nearbyPlacesHandler);

export default router;
