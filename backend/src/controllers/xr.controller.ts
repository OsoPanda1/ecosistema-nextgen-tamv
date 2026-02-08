/**
 * XR Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as xrService from '../services/xr.service';

export async function createXREventHandler(
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

    const event = await xrService.createXREvent({
      actorId,
      eventType: req.body.eventType,
      payload: req.body.payload,
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

export async function listXREventsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const events = await xrService.listXREvents(limit, offset);

    res.json(events);
  } catch (error) {
    next(error);
  }
}
