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

export async function executeProtocolCommand(
  command: ProtocolCommand,
  context: ProtocolContext
): Promise<OrchestratorResult> {
  const event = evaluateProtocol(command, context);

  await createEOCTEvaluation({
    actorId: context.actorId,
    subjectType: 'protocol',
    subjectId: event.id,
    score: event.decision.allowed ? 0.95 : 0.35,
    verdict: event.decision.allowed ? 'approved' : 'rejected',
    notes: event.decision.reasons.join(', ') || 'no_violations',
  });

  await createIsabellaDecision({
    actorId: context.actorId,
    prompt: `Protocol ${command.protocolId} ${command.action}`,
    response: event.decision.allowed
      ? 'Decision approved under constitution.'
      : `Decision rejected: ${event.decision.reasons.join(', ')}`,
    ethicsScore: event.decision.allowed ? 0.92 : 0.2,
    context: {
      protocolId: command.protocolId,
      action: command.action,
      layer: context.layer,
    },
  });

  await recordProtocolEventToMSR(event);
  await recordProtocolEventToBookPI(event);

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
