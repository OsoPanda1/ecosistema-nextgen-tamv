/**
 * EOCT Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as eoctService from '../services/eoct.service';

export async function createEvaluationHandler(
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

    const evaluation = await eoctService.createEOCTEvaluation({
      actorId,
      subjectType: req.body.subjectType,
      subjectId: req.body.subjectId,
      score: req.body.score,
      verdict: req.body.verdict,
      notes: req.body.notes,
    });

    res.status(201).json(evaluation);
  } catch (error) {
    next(error);
  }
}

export async function listEvaluationsHandler(
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

    const evaluations = await eoctService.listEOCTEvaluationsForActor(
      actorId,
      req.user?.role || 'user',
      limit,
      offset
    );

    res.json(evaluations);
  } catch (error) {
    next(error);
  }
}

export async function evaluateEOCTHandler(
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

    const evaluation = await eoctService.evaluateAndCreateEOCTEvaluation(
      actorId,
      req.body.subjectType,
      req.body.subjectId,
      req.body.signals || {},
      req.body.notes
    );

    res.status(201).json(evaluation);
  } catch (error) {
    next(error);
  }
}
