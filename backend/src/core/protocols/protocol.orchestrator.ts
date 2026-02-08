/**
 * Protocol Orchestrator
 * Integrates constitution, EOCT, Isabella, MSR, BookPI, Guardian, and XR.
 */

import { evaluateProtocol } from './protocol.engine';
import { createGuardianEvent } from './protocol.monitoring.guardian';
import { translateGuardianEventToXR } from './protocol.visual.xr';
import { recordProtocolEventToMSR } from './protocol.msr.adapter';
import { recordProtocolEventToBookPI } from './protocol.bookpi.adapter';
import { ProtocolCommand, ProtocolContext, ProtocolEvent } from './protocol.types';
import { createEOCTEvaluation } from '../../services/eoct.service';
import { createIsabellaDecision } from '../../services/isabella.service';
import { createXREvent } from '../../services/xr.service';

export interface OrchestratorResult {
  event: ProtocolEvent;
  guardianEventId: string;
  xrSceneId: string;
}

const EOCT_APPROVED_SCORE = 0.95;
const EOCT_REJECTED_SCORE = 0.35;
const ISABELLA_APPROVED_SCORE = 0.92;
const ISABELLA_REJECTED_SCORE = 0.2;

export async function executeProtocolCommand(
  command: ProtocolCommand,
  context: ProtocolContext
): Promise<OrchestratorResult> {
  const event = evaluateProtocol(command, context);

  await Promise.all([
    createEOCTEvaluation({
      actorId: context.actorId,
      subjectType: 'protocol',
      subjectId: event.id,
      score: event.decision.allowed ? EOCT_APPROVED_SCORE : EOCT_REJECTED_SCORE,
      verdict: event.decision.allowed ? 'approved' : 'rejected',
      notes: event.decision.reasons.join(', ') || 'no_violations',
    }),
    createIsabellaDecision({
      actorId: context.actorId,
      prompt: `Protocol ${command.protocolId} ${command.action}`,
      response: event.decision.allowed
        ? 'Decision approved under constitution.'
        : `Decision rejected: ${event.decision.reasons.join(', ')}`,
      ethicsScore: event.decision.allowed
        ? ISABELLA_APPROVED_SCORE
        : ISABELLA_REJECTED_SCORE,
      context: {
        protocolId: command.protocolId,
        action: command.action,
        layer: context.layer,
      },
    }),
    recordProtocolEventToMSR(event),
    recordProtocolEventToBookPI(event),
  ]);

  const guardianEvent = createGuardianEvent(event.protocolId, event.decision, {
    actorId: context.actorId,
    eventId: event.id,
  });

  const xrUpdate = translateGuardianEventToXR(guardianEvent);

  await createXREvent({
    actorId: context.actorId,
    eventType: 'guardian_update',
    payload: xrUpdate,
  });

  return {
    event,
    guardianEventId: guardianEvent.id,
    xrSceneId: xrUpdate.sceneId,
  };
}
