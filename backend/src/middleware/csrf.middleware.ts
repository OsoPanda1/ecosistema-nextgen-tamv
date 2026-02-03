/**
 * CSRF Protection Middleware
 * Prevents Cross-Site Request Forgery attacks
 */

import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF protection middleware
 * Uses double-submit cookie pattern
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

/**
 * Attach CSRF token to response
 */
export function attachCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.csrfToken = req.csrfToken();
  next();
}

/**
 * Send CSRF token endpoint
 */
export function getCsrfToken(req: Request, res: Response): void {
  res.json({ csrfToken: req.csrfToken() });
}
