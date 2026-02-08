/**
 * DreamSpaces Permissions Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import * as permissionsController from '../controllers/dreamspaces.permissions.controller';

const router = Router({ mergeParams: true });

const permissionSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['viewer', 'editor', 'guardian']),
});

router.get('/', requireAuth, permissionsController.listPermissionsHandler);

router.post(
  '/',
  requireAuth,
  validateBody(permissionSchema),
  permissionsController.grantPermissionHandler
);

router.delete('/:userId', requireAuth, permissionsController.revokePermissionHandler);

export default router;
