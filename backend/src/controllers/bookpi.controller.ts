/**
 * BookPI Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as bookpiService from '../services/bookpi.service';

export async function createEntryHandler(
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

    const entry = await bookpiService.createBookPIEntry({
      actorId,
      title: req.body.title,
      narrative: req.body.narrative,
      context: req.body.context,
      visibility: req.body.visibility,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
}

export async function listEntriesHandler(
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

    const limit = req.query.limit as number;
    const offset = req.query.offset as number;

    const entries = await bookpiService.listBookPIEntriesForActor(
      actorId,
      req.user?.role || 'user',
      limit,
      offset
    );

    res.json(entries);
  } catch (error) {
    next(error);
  }
}
