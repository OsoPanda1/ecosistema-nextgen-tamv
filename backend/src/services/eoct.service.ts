/**
 * EOCT Service
 * Ethical continuous evaluation and traceability.
 */

import pool from '../config/database';

export interface EOCTEvaluationInput {
  actorId: string;
  subjectType: string;
  subjectId?: string;
  score: number;
  verdict: 'approved' | 'rejected' | 'review';
  notes?: string;
}

export interface EOCTEvaluation extends EOCTEvaluationInput {
  id: string;
  createdAt: string;
}

export async function createEOCTEvaluation(
  input: EOCTEvaluationInput
): Promise<EOCTEvaluation> {
  const result = await pool.query<EOCTEvaluation>(
    `INSERT INTO eoct_evaluations (actor_id, subject_type, subject_id, score, verdict, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, actor_id as "actorId", subject_type as "subjectType", subject_id as "subjectId",
       score, verdict, notes, created_at as "createdAt"`,
    [
      input.actorId,
      input.subjectType,
      input.subjectId || null,
      input.score,
      input.verdict,
      input.notes || null,
    ]
  );

  return result.rows[0];
}

export async function listEOCTEvaluations(
  limit = 20,
  offset = 0
): Promise<EOCTEvaluation[]> {
  const result = await pool.query<EOCTEvaluation>(
    `SELECT id, actor_id as "actorId", subject_type as "subjectType", subject_id as "subjectId",
      score, verdict, notes, created_at as "createdAt"
     FROM eoct_evaluations
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}
