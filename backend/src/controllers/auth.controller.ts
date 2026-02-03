/**
 * Authentication Controller
 * HTTP handlers for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { createError } from '../middleware/error.middleware';

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, username, password, display_name } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await authService.register(
      { email, username, password, display_name },
      ipAddress,
      userAgent
    );

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already')) {
        next(createError(error.message, 409));
      } else {
        next(createError(error.message, 400));
      }
    } else {
      next(error);
    }
  }
}

/**
 * POST /api/v1/auth/login
 * Login user
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 401));
    } else {
      next(error);
    }
  }
}

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await authService.logout(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token is required', 400);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 401));
    } else {
      next(error);
    }
  }
}
