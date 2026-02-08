/**
 * Feed Routes
 * Routes for personalized feed
 */

import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import { paginationSchema } from '../utils/validation';
import { apiLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

/**
 * GET /api/v1/feed
 * Get personalized feed
 */
router.get(
  '/',
  requireAuth,
  validateQuery(paginationSchema),
  postController.getFeedHandler
);

/**
 * GET /api/v1/feed/global
 * Get global public feed
 */
router.get(
  '/global',
  validateQuery(paginationSchema),
  postController.getGlobalFeedHandler
);

export default router;
