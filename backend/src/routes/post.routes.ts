/**
 * Post Routes
 * Routes for post management
 */

import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import { createPostSchema, updatePostSchema, createCommentSchema, uuidSchema, paginationSchema } from '../utils/validation';
import { apiLimiter, createPostLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply rate limiting
router.use(apiLimiter);

/**
 * GET /api/v1/posts
 * List posts with pagination
 */
router.get(
  '/',
  optionalAuth,
  validateQuery(paginationSchema),
  postController.listPostsHandler
);

/**
 * POST /api/v1/posts
 * Create a new post
 */
router.post(
  '/',
  requireAuth,
  createPostLimiter,
  validateBody(createPostSchema),
  postController.createPostHandler
);

/**
 * GET /api/v1/posts/:id
 * Get post by ID
 */
router.get(
  '/:id',
  optionalAuth,
  validateParams(uuidSchema),
  postController.getPostHandler
);

/**
 * PUT /api/v1/posts/:id
 * Update post
 */
router.put(
  '/:id',
  requireAuth,
  validateParams(uuidSchema),
  validateBody(updatePostSchema),
  postController.updatePostHandler
);

/**
 * DELETE /api/v1/posts/:id
 * Delete post
 */
router.delete(
  '/:id',
  requireAuth,
  validateParams(uuidSchema),
  postController.deletePostHandler
);

/**
 * POST /api/v1/posts/:id/like
 * Like a post
 */
router.post(
  '/:id/like',
  requireAuth,
  validateParams(uuidSchema),
  postController.likePostHandler
);

/**
 * DELETE /api/v1/posts/:id/like
 * Unlike a post
 */
router.delete(
  '/:id/like',
  requireAuth,
  validateParams(uuidSchema),
  postController.unlikePostHandler
);

/**
 * GET /api/v1/posts/:id/comments
 * Get comments for a post
 */
router.get(
  '/:id/comments',
  optionalAuth,
  validateParams(uuidSchema),
  validateQuery(paginationSchema),
  postController.getPostCommentsHandler
);

/**
 * POST /api/v1/posts/:id/comments
 * Create a comment on a post
 */
router.post(
  '/:id/comments',
  requireAuth,
  validateParams(uuidSchema),
  validateBody(createCommentSchema),
  postController.createCommentHandler
);

export default router;
