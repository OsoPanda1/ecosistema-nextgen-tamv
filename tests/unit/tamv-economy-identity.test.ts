const mockPoolQuery = jest.fn();
const mockQuery = jest.fn();

jest.mock('../../backend/src/config/database', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => mockPoolQuery(...args) },
}));

jest.mock('../../backend/src/utils/database', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

import {
  createLedgerEntry,
  createMembership,
  upsertTokenBalance,
} from '../../backend/src/services/economy.service';
import { createIdentity, updateIdentity } from '../../backend/src/services/identity.service';

describe('TAMV Economy + Identity Services', () => {
  beforeEach(() => {
    mockPoolQuery.mockReset();
    mockQuery.mockReset();
  });

  it('creates economy records for ledger/tokens/memberships', async () => {
    mockPoolQuery
      .mockResolvedValueOnce({ rows: [{ id: 'l1', userId: 'u1', amount: 42 }] })
      .mockResolvedValueOnce({ rows: [{ id: 't1', userId: 'u1', tokenType: 'usage', balance: 100 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'm1', userId: 'u1', tier: 'creator', status: 'active' }] });

    const ledger = await createLedgerEntry({
      userId: 'u1',
      amount: 42,
      currency: 'TAMV-CREDIT',
      entryType: 'credit',
      reference: 'initial-allocation',
    });

    const token = await upsertTokenBalance({
      userId: 'u1',
      tokenType: 'usage',
      balance: 100,
    });

    const membership = await createMembership({
      userId: 'u1',
      tier: 'creator',
      status: 'active',
    });

    expect(ledger.id).toBe('l1');
    expect(token.id).toBe('t1');
    expect(membership.id).toBe('m1');
    expect(mockPoolQuery).toHaveBeenCalledTimes(3);
  });

  it('creates and updates identity with validation', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'i1', user_id: 'u1', dignity_score: 100, reputation: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'i1', user_id: 'u1', dignity_score: 96, reputation: 10 }] });

    const created = await createIdentity({ user_id: 'u1' });
    const updated = await updateIdentity('u1', { dignity_score: 96, reputation: 10 });

    expect(created.id).toBe('i1');
    expect(updated.reputation).toBe(10);

    await expect(updateIdentity('u1', {})).rejects.toThrow('No fields to update');
  });
});
