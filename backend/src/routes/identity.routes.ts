import { Router } from 'express';
import * as identityController from '../controllers/identity.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateParams } from '../middleware/validation.middleware';
import { uuidSchema } from '../utils/validation';
import { apiLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.use(apiLimiter);

/**
 * POST /api/v1/identity/init
 * Initialize identity for current user
 */
router.post('/init', requireAuth, identityController.initIdentity);

/**
 * GET /api/v1/identity/:userId
 * Get identity by user ID
 */
router.get(
  '/:userId',
  validateParams(uuidSchema.extend({ userId: uuidSchema.shape.id })),
  identityController.getIdentity
);

/**
 * PUT /api/v1/identity/:userId
 * Update identity
 */
router.put(
  '/:userId',
  requireAuth,
  validateParams(uuidSchema.extend({ userId: uuidSchema.shape.id })),
  identityController.updateIdentityHandler
);

export default router;
