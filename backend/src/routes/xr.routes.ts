/**
 * XR Routes
 * Manages XR sessions, events, and scene management.
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.middleware';
import * as xrController from '../controllers/xr.controller';

const router = Router();

const xrEventSchema = z.object({
  eventType: z.string().min(2),
  payload: z.record(z.unknown()),
  sessionId: z.string().optional(),
});

const xrSessionSchema = z.object({
  sessionType: z.string().optional().default('standard'),
  metadata: z.record(z.unknown()).optional(),
});

const xrSessionUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'ended']).optional(),
  currentSceneId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const xrSceneSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
  initialPayload: z.record(z.unknown()).optional(),
});

const xrSceneEnhancementSchema = z.object({
  updates: z.object({
    mood: z.enum(['calm', 'alert', 'critical']).optional(),
    overlays: z.array(z.string()).optional(),
  }),
});

const paginationSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  sessionId: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
});

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

const sceneIdParamsSchema = z.object({
  sceneId: z.string().uuid(),
});

// Session management routes
router.post(
  '/sessions',
  requireAuth,
  validateBody(xrSessionSchema),
  xrController.createXRSessionHandler
);

router.get(
  '/sessions',
  requireAuth,
  validateQuery(paginationSchema),
  xrController.listXRSessionsHandler
);

router.get(
  '/sessions/:id',
  validateParams(idParamsSchema),
  xrController.getXRSessionHandler
);

router.patch(
  '/sessions/:id',
  requireAuth,
  validateParams(idParamsSchema),
  validateBody(xrSessionUpdateSchema),
  xrController.updateXRSessionHandler
);

router.post(
  '/sessions/:id/end',
  requireAuth,
  validateParams(idParamsSchema),
  xrController.endXRSessionHandler
);

// Scene management routes
router.post(
  '/scenes',
  validateBody(xrSceneSchema),
  xrController.createXRSceneHandler
);

router.get(
  '/scenes',
  validateQuery(paginationSchema),
  xrController.listXRScenesHandler
);

router.get(
  '/scenes/:id',
  validateParams(idParamsSchema),
  xrController.getXRSceneHandler
);

// Event routes
router.post(
  '/events',
  requireAuth,
  validateBody(xrEventSchema),
  xrController.createXREventHandler
);

router.get(
  '/events',
  validateQuery(paginationSchema),
  xrController.listXREventsHandler
);

// Quantum enhancement routes
router.post(
  '/scenes/:sceneId/quantum-enhance',
  requireAuth,
  validateParams(sceneIdParamsSchema),
  validateBody(xrSceneEnhancementSchema),
  xrController.quantumEnhanceSceneHandler
);

export default router;
