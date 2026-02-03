import { query } from '../utils/database';
import { Identity, CreateIdentityDTO, UpdateIdentityDTO } from '../models/Identity';

export async function createIdentity(data: CreateIdentityDTO): Promise<Identity> {
  const result = await query<Identity>(
    `INSERT INTO identities (user_id, dignity_score, reputation)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.user_id, data.dignity_score || 100, data.reputation || 0]
  );

  return result.rows[0];
}

export async function getIdentityByUserId(userId: string): Promise<Identity | null> {
  const result = await query<Identity>('SELECT * FROM identities WHERE user_id = $1', [userId]);

  return result.rows[0] || null;
}

export async function updateIdentity(userId: string, data: UpdateIdentityDTO): Promise<Identity> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.dignity_score !== undefined) {
    updates.push(`dignity_score = $${paramIndex++}`);
    values.push(data.dignity_score);
  }

  if (data.reputation !== undefined) {
    updates.push(`reputation = $${paramIndex++}`);
    values.push(data.reputation);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(userId);

  const result = await query<Identity>(
    `UPDATE identities SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $${paramIndex}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Identity not found');
  }

  return result.rows[0];
}

export async function dignityDecay(): Promise<number> {
  const result = await query(
    `UPDATE identities
     SET dignity_score = dignity_score - 1
     WHERE dignity_score > 0`
  );

  return result.rowCount || 0;
}
