import { Request, Response, NextFunction } from 'express';
import { Power, hasRequiredPower } from '../core/governance/powers';

export function powerGuard(required: Power) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.powers || !hasRequiredPower(req.powers, required)) {
      res.status(403).json({ error: 'POWER_DENIED', required });
      return;
    }
    next();
  };
}
