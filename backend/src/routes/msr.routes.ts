import { Router } from 'express';
import * as msrController from '../controllers/msr.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateParams, validateQuery } from '../middleware/validation.middleware';
import { uuidSchema, paginationSchema } from '../utils/validation';
import { apiLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.use(apiLimiter);

/**
 * POST /api/v1/msr/log
 * Log MSR event
 */
router.post('/log', requireAuth, msrController.logEvent);

/**
 * GET /api/v1/msr/events
 * Get all MSR events (paginated)
 */
router.get('/events', validateQuery(paginationSchema), msrController.getEvents);

/**
 * GET /api/v1/msr/events/:actorId
 * Get MSR events by actor
 */
router.get(
  '/events/:actorId',
  validateParams(uuidSchema.extend({ actorId: uuidSchema.shape.id })),
  validateQuery(paginationSchema),
  msrController.getEventsByActor
);

export default router;
