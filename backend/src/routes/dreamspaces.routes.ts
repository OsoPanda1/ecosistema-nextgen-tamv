/**
 * DreamSpaces Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as dreamspacesController from '../controllers/dreamspaces.controller';
import permissionsRoutes from './dreamspaces.permissions.routes';

const router = Router();

const dreamspaceSchema = z.object({
  name: z.string().min(2),
  accessLevel: z.enum(['public', 'private', 'guardian']),
  metadata: z.record(z.unknown()).optional(),
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
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

router.use('/:id/permissions', permissionsRoutes);

export default router;
