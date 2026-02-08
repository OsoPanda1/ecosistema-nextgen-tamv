/**
 * XR Service
 * Tracks XR events and scene updates.
 */

import pool from '../config/database';

export interface XREventInput {
  actorId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface XREvent extends XREventInput {
  id: string;
  createdAt: string;
}

export async function createXREvent(input: XREventInput): Promise<XREvent> {
  const result = await pool.query<XREvent>(
    `INSERT INTO xr_events (actor_id, event_type, payload)
     VALUES ($1, $2, $3)
     RETURNING id, actor_id as "actorId", event_type as "eventType", payload, created_at as "createdAt"`,
    [input.actorId, input.eventType, input.payload]
  );

  return result.rows[0];
}

export async function listXREvents(limit = 20, offset = 0): Promise<XREvent[]> {
  const result = await pool.query<XREvent>(
    `SELECT id, actor_id as "actorId", event_type as "eventType", payload, created_at as "createdAt"
     FROM xr_events
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}
