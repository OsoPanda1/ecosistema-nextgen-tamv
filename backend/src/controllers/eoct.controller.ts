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
    const actorId = req.user?.id;
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
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const evaluations = await eoctService.listEOCTEvaluations(limit, offset);

    res.json(evaluations);
  } catch (error) {
    next(error);
  }
}
