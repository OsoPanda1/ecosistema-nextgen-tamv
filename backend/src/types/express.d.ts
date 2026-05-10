import type { Power } from '../core/governance/powers';
import type { TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      powers?: Power[];
    }
  }
}

export {};
