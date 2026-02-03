import crypto from 'crypto';
import { query } from '../utils/database';
import { MSREvent, CreateMSREventDTO } from '../models/MSREvent';

export function msrHash(data: Record<string, any>): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

export async function logMSREvent(event: CreateMSREventDTO): Promise<MSREvent> {
  const hash = msrHash(event);

  const result = await query<MSREvent>(
    `INSERT INTO msr_events (actor_id, action, payload, hash)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [event.actor_id || null, event.action, JSON.stringify(event.payload), hash]
  );

  return result.rows[0];
}

export async function getMSREvents(limit: number = 50, offset: number = 0): Promise<MSREvent[]> {
  const result = await query<MSREvent>(
    `SELECT * FROM msr_events
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

export async function getMSREventsByActor(
  actorId: string,
  limit: number = 50
): Promise<MSREvent[]> {
  const result = await query<MSREvent>(
    `SELECT * FROM msr_events
     WHERE actor_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [actorId, limit]
  );

  return result.rows;
}
