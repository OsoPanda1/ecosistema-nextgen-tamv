/**
 * DreamSpaces Permissions Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as permissionsService from '../services/dreamspaces.permissions.service';

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
    const permissions = await permissionsService.listDreamspacePermissions(req.params.id);

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
    await permissionsService.revokeDreamspacePermission(req.params.id, req.params.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
