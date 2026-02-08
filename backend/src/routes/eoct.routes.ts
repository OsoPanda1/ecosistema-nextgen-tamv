/**
 * EOCT Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as eoctController from '../controllers/eoct.controller';

const router = Router();

const evaluationSchema = z.object({
  subjectType: z.string().min(2),
  subjectId: z.string().optional(),
  score: z.number().min(0).max(1),
  verdict: z.enum(['approved', 'rejected', 'review']),
  notes: z.string().optional(),
});

const evaluateSchema = z.object({
  subjectType: z.string().min(2),
  subjectId: z.string().optional(),
  signals: z
    .object({
      coercionRisk: z.number().min(0).max(1).optional(),
      harmRisk: z.number().min(0).max(1).optional(),
      privacyRisk: z.number().min(0).max(1).optional(),
      transparencyRisk: z.number().min(0).max(1).optional(),
      legalRisk: z.number().min(0).max(1).optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

const paginationSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
});

router.post(
  '/evaluations',
  requireAuth,
  validateBody(evaluationSchema),
  eoctController.createEvaluationHandler
);

router.get(
  '/evaluations',
  requireAuth,
  validateQuery(paginationSchema),
  eoctController.listEvaluationsHandler
);

router.post(
  '/evaluate',
  requireAuth,
  validateBody(evaluateSchema),
  eoctController.evaluateEOCTHandler
);

export default router;
