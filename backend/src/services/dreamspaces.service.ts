/**
 * DreamSpaces Service
 * Persistent XR spaces and access controls.
 */

import pool from '../config/database';

export interface DreamspaceInput {
  name: string;
  ownerId: string;
  accessLevel: 'public' | 'private' | 'guardian';
  metadata?: Record<string, unknown>;
}

export interface Dreamspace extends DreamspaceInput {
  id: string;
  createdAt: string;
}

export async function createDreamspace(
  input: DreamspaceInput
): Promise<Dreamspace> {
  const result = await pool.query<Dreamspace>(
    `INSERT INTO dreamspaces (name, owner_id, access_level, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, owner_id as "ownerId", access_level as "accessLevel",
       metadata, created_at as "createdAt"`,
    [input.name, input.ownerId, input.accessLevel, input.metadata || {}]
  );

  return result.rows[0];
}

export async function listDreamspaces(
  limit = 20,
  offset = 0
): Promise<Dreamspace[]> {
  const result = await pool.query<Dreamspace>(
    `SELECT id, name, owner_id as "ownerId", access_level as "accessLevel",
      metadata, created_at as "createdAt"
     FROM dreamspaces
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}
