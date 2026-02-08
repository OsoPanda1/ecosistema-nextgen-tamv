/**
 * BookPI Service
 * Narratives and context storage for civilizational memory.
 */

import pool from '../config/database';

export interface BookPIEntryInput {
  actorId: string;
  title: string;
  narrative: string;
  context?: Record<string, unknown>;
  visibility?: 'public' | 'internal' | 'restricted';
}

export interface BookPIEntry extends BookPIEntryInput {
  id: string;
  createdAt: string;
}

export async function createBookPIEntry(
  input: BookPIEntryInput
): Promise<BookPIEntry> {
  const result = await pool.query<BookPIEntry>(
    `INSERT INTO bookpi_entries (actor_id, title, narrative, context, visibility)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, actor_id as "actorId", title, narrative, context, visibility, created_at as "createdAt"`,
    [
      input.actorId,
      input.title,
      input.narrative,
      input.context || {},
      input.visibility || 'internal',
    ]
  );

  return result.rows[0];
}

export async function listBookPIEntries(
  limit = 20,
  offset = 0
): Promise<BookPIEntry[]> {
  const result = await pool.query<BookPIEntry>(
    `SELECT id, actor_id as "actorId", title, narrative, context, visibility, created_at as "createdAt"
     FROM bookpi_entries
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

export async function getBookPIEntriesByActor(
  actorId: string,
  limit = 20
): Promise<BookPIEntry[]> {
  const result = await pool.query<BookPIEntry>(
    `SELECT id, actor_id as "actorId", title, narrative, context, visibility, created_at as "createdAt"
     FROM bookpi_entries
     WHERE actor_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [actorId, limit]
  );

  return result.rows;
}
