/**
 * Economy Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as economyService from '../services/economy.service';

export async function createLedgerEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (requesterRole !== 'admin' && req.body.userId !== requesterId) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    if (req.body.amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than zero' });
      return;
    }

    const entry = await economyService.createLedgerEntry({
      userId: req.body.userId,
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
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = typeof req.query.limit === 'number' ? req.query.limit : 20;
    const offset = typeof req.query.offset === 'number' ? req.query.offset : 0;

    const entries =
      requesterRole === 'admin'
        ? await economyService.listLedgerEntries(limit, offset)
        : await economyService.listLedgerEntriesForUser(
            requesterId,
            limit,
            offset
          );

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
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (requesterRole !== 'admin' && req.body.userId !== requesterId) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    if (req.body.balance < 0) {
      res.status(400).json({ error: 'Balance cannot be negative' });
      return;
    }

    const balance = await economyService.upsertTokenBalance({
      userId: req.body.userId,
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
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = typeof req.query.limit === 'number' ? req.query.limit : 20;
    const offset = typeof req.query.offset === 'number' ? req.query.offset : 0;

    const balances =
      requesterRole === 'admin'
        ? await economyService.listTokenBalances(limit, offset)
        : await economyService.listTokenBalancesForUser(
            requesterId,
            limit,
            offset
          );

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
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (requesterRole !== 'admin' && req.body.userId !== requesterId) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const membership = await economyService.createMembership({
      userId: req.body.userId,
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
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    if (!requesterId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = typeof req.query.limit === 'number' ? req.query.limit : 20;
    const offset = typeof req.query.offset === 'number' ? req.query.offset : 0;

    const memberships =
      requesterRole === 'admin'
        ? await economyService.listMemberships(limit, offset)
        : await economyService.listMembershipsForUser(
            requesterId,
            limit,
            offset
          );

    res.json(memberships);
  } catch (error) {
    next(error);
  }
}
