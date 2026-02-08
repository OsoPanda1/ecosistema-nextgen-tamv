/**
 * Economy Service
 * Ledger, tokens, and memberships.
 */

import pool from '../config/database';

export interface LedgerEntryInput {
  userId: string;
  amount: number;
  currency: string;
  entryType: 'credit' | 'debit' | 'reward' | 'fee';
  reference?: string;
  metadata?: Record<string, unknown>;
}

export interface LedgerEntry extends LedgerEntryInput {
  id: string;
  createdAt: string;
}

export interface TokenBalanceInput {
  userId: string;
  tokenType: string;
  balance: number;
}

export interface TokenBalance extends TokenBalanceInput {
  id: string;
  updatedAt: string;
}

export interface MembershipInput {
  userId: string;
  tier: 'free' | 'creator' | 'guardian' | 'institutional';
  status: 'active' | 'paused' | 'expired';
  endsAt?: string | null;
}

export interface Membership extends MembershipInput {
  id: string;
  startedAt: string;
}

export async function createLedgerEntry(
  input: LedgerEntryInput
): Promise<LedgerEntry> {
  const result = await pool.query<LedgerEntry>(
    `INSERT INTO economy_ledger (user_id, amount, currency, entry_type, reference, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id as "userId", amount, currency, entry_type as "entryType",
       reference, metadata, created_at as "createdAt"`,
    [
      input.userId,
      input.amount,
      input.currency,
      input.entryType,
      input.reference || null,
      input.metadata || {},
    ]
  );

  return result.rows[0];
}

export async function listLedgerEntries(
  limit = 20,
  offset = 0
): Promise<LedgerEntry[]> {
  const result = await pool.query<LedgerEntry>(
    `SELECT id, user_id as "userId", amount, currency, entry_type as "entryType",
      reference, metadata, created_at as "createdAt"
     FROM economy_ledger
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

export async function upsertTokenBalance(
  input: TokenBalanceInput
): Promise<TokenBalance> {
  const result = await pool.query<TokenBalance>(
    `INSERT INTO token_balances (user_id, token_type, balance)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, token_type)
     DO UPDATE SET balance = EXCLUDED.balance, updated_at = NOW()
     RETURNING id, user_id as "userId", token_type as "tokenType", balance, updated_at as "updatedAt"`,
    [input.userId, input.tokenType, input.balance]
  );

  return result.rows[0];
}

export async function listTokenBalances(
  limit = 20,
  offset = 0
): Promise<TokenBalance[]> {
  const result = await pool.query<TokenBalance>(
    `SELECT id, user_id as "userId", token_type as "tokenType", balance, updated_at as "updatedAt"
     FROM token_balances
     ORDER BY updated_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

export async function createMembership(
  input: MembershipInput
): Promise<Membership> {
  const result = await pool.query<Membership>(
    `INSERT INTO memberships (user_id, tier, status, ends_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id as "userId", tier, status, ends_at as "endsAt", started_at as "startedAt"`,
    [input.userId, input.tier, input.status, input.endsAt || null]
  );

  return result.rows[0];
}

export async function listMemberships(
  limit = 20,
  offset = 0
): Promise<Membership[]> {
  const result = await pool.query<Membership>(
    `SELECT id, user_id as "userId", tier, status, ends_at as "endsAt", started_at as "startedAt"
     FROM memberships
     ORDER BY started_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}
