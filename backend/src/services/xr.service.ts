/**
 * XR Service
 * Tracks XR events, scene updates, and manages XR session lifecycle.
 */

import pool from '../config/database';
import { XRSceneUpdate } from '../core/protocols/protocol.types';
import { quantumEngine } from '../core/quantum/quantum.engine';

export interface XREventInput {
  actorId: string;
  eventType: string;
  payload: Record<string, unknown>;
  sessionId?: string;
}

export interface XREvent extends XREventInput {
  id: string;
  createdAt: string;
}

export interface XRSession {
  id: string;
  actorId: string;
  sessionType: string;
  status: 'active' | 'inactive' | 'ended';
  currentSceneId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface XRScene {
  id: string;
  name: string;
  type: string;
  description?: string;
  initialPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export async function createXREvent(input: XREventInput): Promise<XREvent> {
  const result = await pool.query<XREvent>(
    `INSERT INTO xr_events (actor_id, event_type, payload, session_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, actor_id as "actorId", event_type as "eventType", payload, session_id as "sessionId", created_at as "createdAt"`,
    [input.actorId, input.eventType, input.payload, input.sessionId]
  );

  return result.rows[0];
}

export async function listXREvents(limit = 20, offset = 0, sessionId?: string): Promise<XREvent[]> {
  let query = `
    SELECT id, actor_id as "actorId", event_type as "eventType", payload, session_id as "sessionId", created_at as "createdAt"
    FROM xr_events
  `;
  const params: any[] = [];

  if (sessionId) {
    query += ` WHERE session_id = $1`;
    params.push(sessionId);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query<XREvent>(query, params);
  return result.rows;
}

export async function createXRSession(actorId: string, sessionType: string = 'standard', metadata?: Record<string, unknown>): Promise<XRSession> {
  const result = await pool.query<XRSession>(
    `INSERT INTO xr_sessions (actor_id, session_type, status, metadata)
     VALUES ($1, $2, 'active', $3)
     RETURNING id, actor_id as "actorId", session_type as "sessionType", status, current_scene_id as "currentSceneId", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
    [actorId, sessionType, metadata]
  );

  return result.rows[0];
}

export async function getXRSession(sessionId: string): Promise<XRSession | null> {
  const result = await pool.query<XRSession>(
    `SELECT id, actor_id as "actorId", session_type as "sessionType", status, current_scene_id as "currentSceneId", metadata, created_at as "createdAt", updated_at as "updatedAt"
     FROM xr_sessions
     WHERE id = $1`,
    [sessionId]
  );

  return result.rows[0] || null;
}

export async function updateXRSession(sessionId: string, updates: Partial<XRSession>): Promise<XRSession | null> {
  const updateFields = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');

  const result = await pool.query<XRSession>(
    `UPDATE xr_sessions
     SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, actor_id as "actorId", session_type as "sessionType", status, current_scene_id as "currentSceneId", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
    [sessionId, ...Object.values(updates)]
  );

  return result.rows[0] || null;
}

export async function endXRSession(sessionId: string): Promise<XRSession | null> {
  const result = await pool.query<XRSession>(
    `UPDATE xr_sessions
     SET status = 'ended', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, actor_id as "actorId", session_type as "sessionType", status, current_scene_id as "currentSceneId", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
    [sessionId]
  );

  return result.rows[0] || null;
}

export async function listXRSessions(actorId?: string, status?: string): Promise<XRSession[]> {
  let query = `
    SELECT id, actor_id as "actorId", session_type as "sessionType", status, current_scene_id as "currentSceneId", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM xr_sessions
  `;
  const params: any[] = [];

  const conditions: string[] = [];
  if (actorId) {
    conditions.push(`actor_id = $${params.length + 1}`);
    params.push(actorId);
  }
  if (status) {
    conditions.push(`status = $${params.length + 1}`);
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query<XRSession>(query, params);
  return result.rows;
}

export async function createXRScene(name: string, type: string, description?: string, initialPayload?: Record<string, unknown>): Promise<XRScene> {
  const result = await pool.query<XRScene>(
    `INSERT INTO xr_scenes (name, type, description, initial_payload)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, type, description, initial_payload as "initialPayload", created_at as "createdAt", updated_at as "updatedAt"`,
    [name, type, description, initialPayload]
  );

  return result.rows[0];
}

export async function getXRScene(sceneId: string): Promise<XRScene | null> {
  const result = await pool.query<XRScene>(
    `SELECT id, name, type, description, initial_payload as "initialPayload", created_at as "createdAt", updated_at as "updatedAt"
     FROM xr_scenes
     WHERE id = $1`,
    [sceneId]
  );

  return result.rows[0] || null;
}

export async function listXRScenes(type?: string): Promise<XRScene[]> {
  let query = `
    SELECT id, name, type, description, initial_payload as "initialPayload", created_at as "createdAt", updated_at as "updatedAt"
    FROM xr_scenes
  `;
  const params: any[] = [];

  if (type) {
    query += ` WHERE type = $1`;
    params.push(type);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query<XRScene>(query, params);
  return result.rows;
}

export async function updateSceneWithQuantumEnhancement(sceneId: string, actorId: string, updates: Partial<XRSceneUpdate>): Promise<XRSceneUpdate> {
  const enhancedUpdates = await quantumEngine.quantumEnhancedProcessing({
    sceneId,
    actorId,
    updates,
    timestamp: new Date().toISOString(),
  });

  return {
    sceneId,
    mood: enhancedUpdates.updates.mood || 'calm',
    overlays: enhancedUpdates.updates.overlays || [],
    updatedAt: new Date().toISOString(),
    quantumEnhanced: true,
    quantumScore: enhancedUpdates.quantumScore,
  };
}
