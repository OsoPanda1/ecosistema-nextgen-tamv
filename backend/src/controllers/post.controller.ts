/**
 * Post Controller
 * HTTP handlers for post management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as postService from '../services/post.service';
import * as likeService from '../services/like.service';
import * as commentService from '../services/comment.service';
import { createError } from '../middleware/error.middleware';

/**
 * POST /api/v1/posts
 * Create a new post
 */
export async function createPostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { content, media_urls, visibility } = req.body;
    const post = await postService.createPost({
      user_id: req.user.userId,
      content,
      media_urls,
      visibility,
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/posts/:id
 * Get post by ID
 */
export async function getPostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);

    if (!post) {
      throw createError('Post not found', 404);
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/posts/:id
 * Update post
 */
export async function updatePostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;
    const data = req.body;

    const post = await postService.updatePost(id, req.user.userId, data);

    res.json(post);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      next(createError(error.message, 404));
    } else {
      next(error);
    }
  }
}

/**
 * DELETE /api/v1/posts/:id
 * Delete post
 */
export async function deletePostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;
    const deleted = await postService.deletePost(id, req.user.userId);

    if (!deleted) {
      throw createError('Post not found or unauthorized', 404);
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/posts
 * List posts with pagination
 */
export async function listPostsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.query.userId as string;

    const result = await postService.listPosts(page, limit, userId);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/posts/:id/like
 * Like a post
 */
export async function likePostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;
    const like = await likeService.likePost({
      post_id: id,
      user_id: req.user.userId,
    });

    res.status(201).json(like);
  } catch (error) {
    if (error instanceof Error && error.message === 'Post already liked') {
      next(createError(error.message, 409));
    } else {
      next(error);
    }
  }
}

/**
 * DELETE /api/v1/posts/:id/like
 * Unlike a post
 */
export async function unlikePostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;
    const unliked = await likeService.unlikePost(id, req.user.userId);

    if (!unliked) {
      throw createError('Like not found', 404);
    }

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/posts/:id/comments
 * Get comments for a post
 */
export async function getPostCommentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await commentService.getPostComments(id, page, limit);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/posts/:id/comments
 * Create a comment on a post
 */
export async function createCommentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;
    const { content, parent_comment_id } = req.body;

    const comment = await commentService.createComment({
      post_id: id,
      user_id: req.user.userId,
      content,
      parent_comment_id,
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/feed
 * Get personalized feed
 */
export async function getFeedHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await postService.getFeed(req.user.userId, page, limit);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/feed/global
 * Get global public feed
 */
export async function getGlobalFeedHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await postService.getGlobalFeed(page, limit);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
