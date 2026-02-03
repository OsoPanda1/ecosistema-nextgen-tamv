import { Request, Response, NextFunction } from 'express';
import { Power, hasRequiredPower } from '../core/governance/powers';

declare module 'express-serve-static-core' {
  interface Request {
    powers?: Power[];
  }
}

export function powerGuard(required: Power) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.powers || !hasRequiredPower(req.powers, required)) {
      res.status(403).json({ error: 'POWER_DENIED', required });
      return;
    }
    next();
  };
}
