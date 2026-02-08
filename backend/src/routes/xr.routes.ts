/**
 * XR Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as xrController from '../controllers/xr.controller';

const router = Router();

const xrEventSchema = z.object({
  eventType: z.string().min(2),
  payload: z.record(z.unknown()),
});

const paginationSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
});

router.post(
  '/events',
  requireAuth,
  validateBody(xrEventSchema),
  xrController.createXREventHandler
);

router.get(
  '/events',
  validateQuery(paginationSchema),
  xrController.listXREventsHandler
);

export default router;
