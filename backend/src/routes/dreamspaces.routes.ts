/**
 * DreamSpaces Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as dreamspacesController from '../controllers/dreamspaces.controller';

const router = Router();

const dreamspaceSchema = z.object({
  name: z.string().min(2),
  accessLevel: z.enum(['public', 'private', 'guardian']),
  metadata: z.record(z.unknown()).optional(),
});

const paginationSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
});

router.post(
  '/',
  requireAuth,
  validateBody(dreamspaceSchema),
  dreamspacesController.createDreamspaceHandler
);

router.get(
  '/',
  validateQuery(paginationSchema),
  dreamspacesController.listDreamspacesHandler
);

export default router;
