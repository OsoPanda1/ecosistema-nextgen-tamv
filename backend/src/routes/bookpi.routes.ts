/**
 * BookPI Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as bookpiController from '../controllers/bookpi.controller';

const router = Router();

const createEntrySchema = z.object({
  title: z.string().min(3),
  narrative: z.string().min(5),
  context: z.record(z.unknown()).optional(),
  visibility: z.enum(['public', 'internal', 'restricted']).optional(),
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

router.post(
  '/entries',
  requireAuth,
  validateBody(createEntrySchema),
  bookpiController.createEntryHandler
);

router.get(
  '/entries',
  requireAuth,
  validateQuery(paginationSchema),
  bookpiController.listEntriesHandler
);

export default router;
