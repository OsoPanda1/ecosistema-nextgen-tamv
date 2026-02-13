/**
 * XR Controller
 * Manages XR sessions, events, and scene management.
 */

import { Request, Response, NextFunction } from 'express';
import * as xrService from '../services/xr.service';
import { createError } from '../middleware/error.middleware';

export async function createXREventHandler(
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

    const event = await xrService.createXREvent({
      actorId,
      eventType: req.body.eventType,
      payload: req.body.payload,
      sessionId: req.body.sessionId,
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
    const sessionId = req.query.sessionId as string;

    const events = await xrService.listXREvents(limit, offset, sessionId);

    res.json(events);
  } catch (error) {
    next(error);
  }
}

export async function createXRSessionHandler(
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

    const session = await xrService.createXRSession(
      actorId,
      req.body.sessionType,
      req.body.metadata
    );

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

export async function getXRSessionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const session = await xrService.getXRSession(id);

    if (!session) {
      return next(createError('Session not found', 404));
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
}

export async function updateXRSessionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const session = await xrService.updateXRSession(id, req.body);

    if (!session) {
      return next(createError('Session not found', 404));
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
}

export async function endXRSessionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const session = await xrService.endXRSession(id);

    if (!session) {
      return next(createError('Session not found', 404));
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
}

export async function listXRSessionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const actorId = req.user?.id;
    const status = req.query.status as string;

    const sessions = await xrService.listXRSessions(actorId, status);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
}

export async function createXRSceneHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const scene = await xrService.createXRScene(
      req.body.name,
      req.body.type,
      req.body.description,
      req.body.initialPayload
    );

    res.status(201).json(scene);
  } catch (error) {
    next(error);
  }
}

export async function getXRSceneHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const scene = await xrService.getXRScene(id);

    if (!scene) {
      return next(createError('Scene not found', 404));
    }

    res.json(scene);
  } catch (error) {
    next(error);
  }
}

export async function listXRScenesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const type = req.query.type as string;
    const scenes = await xrService.listXRScenes(type);
    res.json(scenes);
  } catch (error) {
    next(error);
  }
}

export async function quantumEnhanceSceneHandler(
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

    const { sceneId } = req.params;
    const enhancedScene = await xrService.updateSceneWithQuantumEnhancement(
      sceneId,
      actorId,
      req.body.updates
    );

    res.json(enhancedScene);
  } catch (error) {
    next(error);
  }
}
