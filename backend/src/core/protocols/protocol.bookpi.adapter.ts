/**
 * Protocol -> BookPI adapter
 * Narrates protocol decisions for BookPI.
 */

import { createBookPIEntry } from '../../services/bookpi.service';
import { ProtocolEvent } from './protocol.types';

export async function recordProtocolEventToBookPI(
  event: ProtocolEvent
): Promise<void> {
  await createBookPIEntry({
    actorId: event.actorId,
    title: `Protocol ${event.protocolId} ${event.phase}`,
    narrative: `Decision: ${event.decision.allowed ? 'approved' : 'rejected'}. Reasons: ${event.decision.reasons.join(', ')}`,
    context: {
      protocolId: event.protocolId,
      phase: event.phase,
      command: event.command,
      decision: event.decision,
    },
    visibility: 'internal',
  });
}
