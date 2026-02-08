/**
 * EOCT Service
 * Ethical continuous evaluation and traceability.
 */

import pool from '../config/database';
import { EOCTSignals, evaluateEOCTPolicy } from './eoct.policy';

export interface EOCTEvaluationInput {
  actorId: string;
  subjectType: string;
  subjectId?: string;
  score: number;
  verdict: 'approved' | 'rejected' | 'review';
  notes?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EOCTEvaluation extends EOCTEvaluationInput {
  id: string;
  createdAt: string;
}

export async function createEOCTEvaluation(
  input: EOCTEvaluationInput
): Promise<EOCTEvaluation> {
  const normalizedScore = Math.max(0, Math.min(1, input.score));
  const result = await pool.query<EOCTEvaluation>(
    `INSERT INTO eoct_evaluations (actor_id, subject_type, subject_id, score, verdict, notes, risk_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, actor_id as "actorId", subject_type as "subjectType", subject_id as "subjectId",
       score, verdict, notes, risk_level as "riskLevel", created_at as "createdAt"`,
    [
      input.actorId,
      input.subjectType,
      input.subjectId || null,
      normalizedScore,
      input.verdict,
      input.notes || null,
      input.riskLevel || 'low',
    ]
  );

  return result.rows[0];
}

export async function evaluateAndCreateEOCTEvaluation(
  actorId: string,
  subjectType: string,
  subjectId: string | undefined,
  signals: EOCTSignals,
  notes?: string
): Promise<EOCTEvaluation> {
  const policy = evaluateEOCTPolicy(signals);

  return createEOCTEvaluation({
    actorId,
    subjectType,
    subjectId,
    score: policy.score,
    verdict: policy.verdict,
    notes: notes || policy.reasons.join(', ') || 'policy_evaluated',
    riskLevel: policy.riskLevel,
  });
}

export async function listEOCTEvaluations(
  limit = 20,
  offset = 0
): Promise<EOCTEvaluation[]> {
  const result = await pool.query<EOCTEvaluation>(
    `SELECT id, actor_id as "actorId", subject_type as "subjectType", subject_id as "subjectId",
      score, verdict, notes, risk_level as "riskLevel", created_at as "createdAt"
     FROM eoct_evaluations
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

export async function listEOCTEvaluationsForActor(
  actorId: string,
  role: string,
  limit = 20,
  offset = 0
): Promise<EOCTEvaluation[]> {
  if (role === 'admin') {
    return listEOCTEvaluations(limit, offset);
  }

  const result = await pool.query<EOCTEvaluation>(
    `SELECT id, actor_id as "actorId", subject_type as "subjectType", subject_id as "subjectId",
      score, verdict, notes, risk_level as "riskLevel", created_at as "createdAt"
     FROM eoct_evaluations
     WHERE actor_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [actorId, limit, offset]
  );

  return result.rows;
}
