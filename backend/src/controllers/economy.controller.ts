/**
 * Economy Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as economyService from '../services/economy.service';

function getAuthorizedUserId(req: Request, requestedUserId?: string): string | null {
  const authenticatedUserId = req.user?.userId;
  if (!authenticatedUserId) {
    return null;
  }

  const isAdmin = req.user?.role === 'admin';
  if (isAdmin) {
    return requestedUserId || authenticatedUserId;
  }

  return authenticatedUserId;
}

export async function createLedgerEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getAuthorizedUserId(req, req.body.userId);
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const entry = await economyService.createLedgerEntry({
      userId,
      amount: req.body.amount,
      currency: req.body.currency,
      entryType: req.body.entryType,
      reference: req.body.reference,
      metadata: req.body.metadata,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
}

export async function listLedgerEntriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const entries = await economyService.listLedgerEntries(limit, offset);

    res.json(entries);
  } catch (error) {
    next(error);
  }
}

export async function upsertTokenBalanceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getAuthorizedUserId(req, req.body.userId);
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const balance = await economyService.upsertTokenBalance({
      userId,
      tokenType: req.body.tokenType,
      balance: req.body.balance,
    });

    res.status(201).json(balance);
  } catch (error) {
    next(error);
  }
}

export async function listTokenBalancesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const balances = await economyService.listTokenBalances(limit, offset);

    res.json(balances);
  } catch (error) {
    next(error);
  }
}

export async function createMembershipHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getAuthorizedUserId(req, req.body.userId);
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const membership = await economyService.createMembership({
      userId,
      tier: req.body.tier,
      status: req.body.status,
      endsAt: req.body.endsAt,
    });

    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
}

export async function listMembershipsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const memberships = await economyService.listMemberships(limit, offset);

    res.json(memberships);
  } catch (error) {
    next(error);
  }
}
