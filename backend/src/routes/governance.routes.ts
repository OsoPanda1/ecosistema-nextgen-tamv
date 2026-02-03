import { Router } from 'express';
import * as governanceController from '../controllers/governance.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.use(apiLimiter);

/**
 * GET /api/v1/governance/powers
 * Get all powers and roles
 */
router.get('/powers', governanceController.getPowers);

/**
 * GET /api/v1/governance/me/powers
 * Get current user's powers
 */
router.get('/me/powers', requireAuth, governanceController.getUserPowers);

export default router;
