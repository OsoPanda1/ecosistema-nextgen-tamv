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
    const actorId = req.user?.id;
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
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const decisions = await isabellaService.listIsabellaDecisions(limit, offset);

    res.json(decisions);
  } catch (error) {
    next(error);
  }
}
