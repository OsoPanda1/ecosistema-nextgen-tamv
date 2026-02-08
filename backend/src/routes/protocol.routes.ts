/**
 * Protocol Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import * as protocolController from '../controllers/protocol.controller';

const router = Router();

const protocolCommandSchema = z.object({
  protocolId: z.enum([
    'fenix',
    'hoyo-negro',
    'future',
    'eoct',
    'guardian',
    'isabella',
    'economy',
    'xr',
    'dreamspaces',
  ]),
  action: z.string().min(2),
  payload: z.record(z.unknown()).optional(),
  layer: z.enum(['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']),
  purpose: z.string().min(3),
  metadata: z.record(z.unknown()).optional(),
});

router.post(
  '/execute',
  requireAuth,
  validateBody(protocolCommandSchema),
  protocolController.executeProtocolHandler
);

export default router;
