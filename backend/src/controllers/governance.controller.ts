import { Request, Response, NextFunction } from 'express';
import { Power, Role, RolePowers } from '../core/governance/powers';

export async function getPowers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({
      powers: Object.values(Power),
      roles: Object.values(Role),
      rolePowers: RolePowers,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserPowers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRole = req.user.role as Role;
    const powers = RolePowers[userRole] || [];

    res.json({
      user_id: req.user.userId,
      role: userRole,
      powers,
    });
  } catch (error) {
    next(error);
  }
}
