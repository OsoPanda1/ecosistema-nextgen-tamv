/**
 * Protocol Controller
 */

import { Request, Response, NextFunction } from 'express';
import { createProtocolCommand } from '../core/protocols/protocol.command';
import { executeProtocolCommand } from '../core/protocols/protocol.orchestrator';

export async function executeProtocolHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const actorId = req.user?.id;
    if (!actorId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { protocolId, action, payload, layer, purpose } = req.body;

    const command = createProtocolCommand(protocolId, action, payload || {});
    const result = await executeProtocolCommand(command, {
      actorId,
      layer,
      purpose,
      metadata: req.body.metadata || {},
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
