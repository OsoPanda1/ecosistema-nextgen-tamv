/**
 * Isabella Service
 * Stores decision traces for the cognitive kernel.
 */

import pool from '../config/database';
import { sanitizeText } from '../utils/sanitization';

export interface IsabellaDecisionInput {
  actorId: string;
  prompt: string;
  response: string;
  ethicsScore: number;
  context?: Record<string, unknown>;
}

export interface IsabellaDecision extends IsabellaDecisionInput {
  id: string;
  createdAt: string;
}

export async function createIsabellaDecision(
  input: IsabellaDecisionInput
): Promise<IsabellaDecision> {
  const prompt = sanitizeText(input.prompt);
  const response = sanitizeText(input.response);
  const ethicsScore = Math.max(0, Math.min(1, input.ethicsScore));

  const result = await pool.query<IsabellaDecision>(
    `INSERT INTO isabella_decisions (actor_id, prompt, response, ethics_score, context)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, actor_id as "actorId", prompt, response, ethics_score as "ethicsScore",
      context, created_at as "createdAt"`,
    [
      input.actorId,
      prompt,
      response,
      ethicsScore,
      input.context || {},
    ]
  );

  return result.rows[0];
}

export async function listIsabellaDecisions(
  limit = 20,
  offset = 0
): Promise<IsabellaDecision[]> {
  const result = await pool.query<IsabellaDecision>(
    `SELECT id, actor_id as "actorId", prompt, response, ethics_score as "ethicsScore",
      context, created_at as "createdAt"
     FROM isabella_decisions
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}
