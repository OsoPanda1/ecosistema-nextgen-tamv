import { Request, Response, NextFunction } from 'express';
import * as msrService from '../services/msr.service';
import { createError } from '../middleware/error.middleware';

export async function logEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { action, payload } = req.body;

    if (!action || !payload) {
      throw createError('Action and payload are required', 400);
    }

    const event = await msrService.logMSREvent({
      actor_id: req.user.userId,
      action,
      payload,
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const events = await msrService.getMSREvents(limit, offset);

    res.json({ events, limit, offset });
  } catch (error) {
    next(error);
  }
}

export async function getEventsByActor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { actorId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const events = await msrService.getMSREventsByActor(actorId, limit);

    res.json({ events, actor_id: actorId });
  } catch (error) {
    next(error);
  }
}
