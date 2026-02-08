/**
 * Isabella Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as isabellaService from '../services/isabella.service';

export async function createDecisionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const actorId = req.user?.id ?? req.user?.userId;
    if (!actorId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decision = await isabellaService.createIsabellaDecision({
      actorId,
      prompt: req.body.prompt,
      response: req.body.response,
      ethicsScore: req.body.ethicsScore,
      context: req.body.context,
    });

    res.status(201).json(decision);
  } catch (error) {
    next(error);
  }
}

export async function listDecisionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = typeof req.query.limit === 'number' ? req.query.limit : 20;
    const offset = typeof req.query.offset === 'number' ? req.query.offset : 0;

    const actorId = req.user?.id ?? req.user?.userId;
    if (!actorId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decisions = await isabellaService.listIsabellaDecisionsForActor(
      actorId,
      req.user?.role || 'user',
      limit,
      offset
    );

    res.json(decisions);
  } catch (error) {
    next(error);
  }
}
