/**
 * Protocol Engine
 * Evaluates commands against constitution and lifecycle rules.
 */

import { evaluateConstitution, toDecision } from './protocol.constitution';
import { nextPhase } from './protocol.lifecycle';
import { ProtocolCommand, ProtocolContext, ProtocolEvent } from './protocol.types';
import { randomUUID } from 'crypto';

export function evaluateProtocol(
  command: ProtocolCommand,
  context: ProtocolContext
): ProtocolEvent {
  const constitutionResult = evaluateConstitution(context, command.payload);
  const decision = toDecision(constitutionResult);
  const phase = nextPhase('init', decision.allowed);

  return {
    id: randomUUID(),
    actorId: context.actorId,
    protocolId: command.protocolId,
    phase,
    command,
    decision: {
      ...decision,
      phase,
    },
    createdAt: new Date().toISOString(),
  };
}
