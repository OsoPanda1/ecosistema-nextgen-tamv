import { Request, Response, NextFunction } from 'express';
import * as identityService from '../services/identity.service';
import * as msrService from '../services/msr.service';
import { createError } from '../middleware/error.middleware';

export async function initIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Check if identity already exists
    const existing = await identityService.getIdentityByUserId(req.user.userId);
    if (existing) {
      res.json(existing);
      return;
    }

    // Create new identity
    const identity = await identityService.createIdentity({
      user_id: req.user.userId,
    });

    // Log MSR event
    await msrService.logMSREvent({
      actor_id: req.user.userId,
      action: 'IDENTITY_CREATED',
      payload: { identity_id: identity.id },
    });

    res.status(201).json(identity);
  } catch (error) {
    next(error);
  }
}

export async function getIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;

    const identity = await identityService.getIdentityByUserId(userId);

    if (!identity) {
      throw createError('Identity not found', 404);
    }

    res.json(identity);
  } catch (error) {
    next(error);
  }
}

export async function updateIdentityHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { userId } = req.params;

    // Only allow updating own identity or admin
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    const identity = await identityService.updateIdentity(userId, req.body);

    // Log MSR event
    await msrService.logMSREvent({
      actor_id: req.user.userId,
      action: 'IDENTITY_UPDATED',
      payload: { identity_id: identity.id, changes: req.body },
    });

    res.json(identity);
  } catch (error) {
    next(error);
  }
}
