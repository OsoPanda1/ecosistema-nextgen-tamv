/**
 * Authorization Middleware
 * Role-based access control (RBAC)
 */

import { Request, Response, NextFunction } from 'express';

type Role = 'user' | 'moderator' | 'admin';

/**
 * Require specific role(s)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Require admin role
 */
export const requireAdmin = requireRole('admin');

/**
 * Require moderator or admin role
 */
export const requireModerator = requireRole('moderator', 'admin');

/**
 * Check if user owns the resource
 */
export function requireOwnership(getUserIdFromParams: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resourceUserId = getUserIdFromParams(req);
    
    // Allow if user owns the resource or is admin
    if (req.user.userId !== resourceUserId && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    next();
  };
}
