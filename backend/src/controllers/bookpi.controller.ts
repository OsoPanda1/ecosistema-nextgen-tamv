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
    const actorId = req.user?.id;
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
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const entries = await bookpiService.listBookPIEntries(limit, offset);

    res.json(entries);
  } catch (error) {
    next(error);
  }
}
