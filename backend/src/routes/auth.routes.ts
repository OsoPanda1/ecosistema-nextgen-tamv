/**
 * Authentication Routes
 * Routes for user authentication
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../utils/validation';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateBody(registerSchema),
  authController.registerHandler
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  validateBody(loginSchema),
  authController.loginHandler
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', authController.logoutHandler);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authController.refreshHandler);

export default router;
