/**
 * TAMV Protocol Constitution
 * Enforces ethical and doctrinal constraints.
 */

import { ProtocolContext, ProtocolDecision, ProtocolPhase } from './protocol.types';

interface ConstitutionResult {
  allowed: boolean;
  reasons: string[];
  phase: ProtocolPhase;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function evaluateConstitution(
  context: ProtocolContext,
  payload: Record<string, unknown>
): ConstitutionResult {
  const reasons: string[] = [];
  let severity: ConstitutionResult['severity'] = 'low';

  if (!context.purpose || context.purpose.trim().length < 3) {
    reasons.push('purpose_required');
    severity = 'medium';
  }

  if (context.layer === 'L0' && payload['override'] === true) {
    reasons.push('do_not_override_doctrine');
    severity = 'critical';
  }

  if (payload['harm_intent'] === true) {
    reasons.push('do_no_harm_violation');
    severity = 'critical';
  }

  if (payload['coercive'] === true) {
    reasons.push('coercion_not_allowed');
    severity = 'high';
  }

  const allowed = reasons.length === 0;

  return {
    allowed,
    reasons,
    phase: allowed ? 'approved' : 'rejected',
    severity,
  };
}

export function toDecision(result: ConstitutionResult): ProtocolDecision {
  return {
    allowed: result.allowed,
    phase: result.phase,
    reasons: result.reasons,
    severity: result.severity,
  };
}
