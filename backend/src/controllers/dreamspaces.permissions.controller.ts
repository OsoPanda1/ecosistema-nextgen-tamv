/**
 * DreamSpaces Permissions Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as permissionsService from '../services/dreamspaces.permissions.service';
import * as dreamspacesService from '../services/dreamspaces.service';

async function ensureDreamspaceAdmin(
  dreamspaceId: string,
  userId: string,
  role?: string
): Promise<boolean> {
  if (role === 'admin') {
    return true;
  }

  const dreamspace = await dreamspacesService.getDreamspaceById(dreamspaceId);
  if (dreamspace && dreamspace.ownerId === userId) {
    return true;
  }

  const permission = await permissionsService.getDreamspacePermission(
    dreamspaceId,
    userId
  );

  return permission?.role === 'guardian';
}

export async function grantPermissionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const grantedBy = req.user?.id ?? req.user?.userId;
    if (!grantedBy) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const allowed = await ensureDreamspaceAdmin(
      req.params.id,
      grantedBy,
      req.user?.role
    );
    if (!allowed) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    if (req.body.userId === grantedBy && req.body.role !== 'viewer' && req.user?.role !== 'admin') {
      res.status(400).json({ error: 'Self-escalation is not allowed' });
      return;
    }

    const permission = await permissionsService.grantDreamspacePermission({
      dreamspaceId: req.params.id,
      userId: req.body.userId,
      role: req.body.role,
      grantedBy,
    });

    res.status(201).json(permission);
  } catch (error) {
    next(error);
  }
}

export async function listPermissionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requesterId = req.user?.id ?? req.user?.userId;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const allowed = await ensureDreamspaceAdmin(
      req.params.id,
      requesterId,
      req.user?.role
    );
    if (!allowed) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const permissions = await permissionsService.listDreamspacePermissions(
      req.params.id
    );

    res.json(permissions);
  } catch (error) {
    next(error);
  }
}

export async function revokePermissionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requesterId = req.user?.id ?? req.user?.userId;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const allowed = await ensureDreamspaceAdmin(
      req.params.id,
      requesterId,
      req.user?.role
    );
    if (!allowed) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    await permissionsService.revokeDreamspacePermission(
      req.params.id,
      req.params.userId
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
