/**
 * Isabella Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as isabellaController from '../controllers/isabella.controller';

const router = Router();

const decisionSchema = z.object({
  prompt: z.string().min(3),
  response: z.string().min(3),
  ethicsScore: z.number().min(0).max(1),
  context: z.record(z.unknown()).optional(),
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

router.post(
  '/decisions',
  requireAuth,
  validateBody(decisionSchema),
  isabellaController.createDecisionHandler
);

router.get(
  '/decisions',
  requireAuth,
  validateQuery(paginationSchema),
  isabellaController.listDecisionsHandler
);

export default router;
