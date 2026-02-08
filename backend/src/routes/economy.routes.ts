/**
 * Economy Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import * as economyController from '../controllers/economy.controller';

const router = Router();

const ledgerSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number(),
  currency: z.string().min(2),
  entryType: z.enum(['credit', 'debit', 'reward', 'fee']),
  reference: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const tokenSchema = z.object({
  userId: z.string().uuid(),
  tokenType: z.string().min(2),
  balance: z.number(),
});

const membershipSchema = z.object({
  userId: z.string().uuid(),
  tier: z.enum(['free', 'creator', 'guardian', 'institutional']),
  status: z.enum(['active', 'paused', 'expired']),
  endsAt: z.string().optional(),
});

const paginationSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
});

router.post(
  '/ledger',
  requireAuth,
  validateBody(ledgerSchema),
  economyController.createLedgerEntryHandler
);

router.get(
  '/ledger',
  requireAuth,
  validateQuery(paginationSchema),
  economyController.listLedgerEntriesHandler
);

router.post(
  '/tokens',
  requireAuth,
  validateBody(tokenSchema),
  economyController.upsertTokenBalanceHandler
);

router.get(
  '/tokens',
  requireAuth,
  validateQuery(paginationSchema),
  economyController.listTokenBalancesHandler
);

router.post(
  '/memberships',
  requireAuth,
  validateBody(membershipSchema),
  economyController.createMembershipHandler
);

router.get(
  '/memberships',
  requireAuth,
  validateQuery(paginationSchema),
  economyController.listMembershipsHandler
);

export default router;
