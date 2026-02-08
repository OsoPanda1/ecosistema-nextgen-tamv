/**
 * Guardian monitoring for protocol events.
 */

import { randomUUID } from 'crypto';
import { GuardianEvent, ProtocolDecision, ProtocolId, ProtocolSeverity } from './protocol.types';

function mapSeverityToThreat(severity: ProtocolSeverity): ProtocolSeverity {
  return severity;
}

export function createGuardianEvent(
  protocolId: ProtocolId,
  decision: ProtocolDecision,
  metadata?: Record<string, unknown>
): GuardianEvent {
  const threatLevel = mapSeverityToThreat(decision.severity);

  return {
    id: randomUUID(),
    protocolId,
    threatLevel,
    summary: decision.allowed
      ? `Protocol ${protocolId} approved.`
      : `Protocol ${protocolId} rejected: ${decision.reasons.join(', ')}`,
    metadata,
    createdAt: new Date().toISOString(),
  };
}
