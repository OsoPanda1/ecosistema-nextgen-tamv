/**
 * User Controller
 * HTTP handlers for user management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { createError } from '../middleware/error.middleware';

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
export async function getUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/users/:id
 * Update user
 */
export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const user = await userService.updateUser(id, data);

    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        next(createError(error.message, 404));
      } else {
        next(createError(error.message, 400));
      }
    } else {
      next(error);
    }
  }
}

/**
 * DELETE /api/v1/users/:id
 * Delete user (soft delete)
 */
export async function deleteUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      throw createError('User not found', 404);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users
 * List users with pagination
 */
export async function listUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    let result;
    if (search) {
      result = await userService.searchUsers(search, page, limit);
    } else {
      result = await userService.listUsers(page, limit);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users/username/:username
 * Get user by username
 */
export async function getUserByUsernameHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}
