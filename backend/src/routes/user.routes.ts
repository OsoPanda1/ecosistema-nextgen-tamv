/**
 * User Routes
 * Routes for user management
 */

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireOwnership } from '../middleware/authorization.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import { updateUserSchema, uuidSchema, paginationSchema } from '../utils/validation';
import { apiLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

/**
 * GET /api/v1/users
 * List users with pagination
 */
router.get(
  '/',
  validateQuery(paginationSchema),
  userController.listUsersHandler
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get(
  '/:id',
  validateParams(uuidSchema),
  userController.getUserHandler
);

/**
 * GET /api/v1/users/username/:username
 * Get user by username
 */
router.get(
  '/username/:username',
  userController.getUserByUsernameHandler
);

/**
 * PUT /api/v1/users/:id
 * Update user (requires authentication and ownership)
 */
router.put(
  '/:id',
  requireAuth,
  validateParams(uuidSchema),
  validateBody(updateUserSchema),
  requireOwnership((req) => req.params.id),
  userController.updateUserHandler
);

/**
 * DELETE /api/v1/users/:id
 * Delete user (requires authentication and ownership)
 */
router.delete(
  '/:id',
  requireAuth,
  validateParams(uuidSchema),
  requireOwnership((req) => req.params.id),
  userController.deleteUserHandler
);

export default router;
