/**
 * DreamSpaces Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as dreamspacesService from '../services/dreamspaces.service';

export async function createDreamspaceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ownerId = req.user?.id ?? req.user?.userId;
    if (!ownerId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const space = await dreamspacesService.createDreamspace({
      name: req.body.name,
      ownerId,
      accessLevel: req.body.accessLevel,
      metadata: req.body.metadata,
    });

    res.status(201).json(space);
  } catch (error) {
    next(error);
  }
}

export async function listDreamspacesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const spaces = await dreamspacesService.listDreamspaces(limit, offset);

    res.json(spaces);
  } catch (error) {
    next(error);
  }
}
