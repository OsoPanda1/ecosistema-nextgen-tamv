/**
 * Protocol -> MSR adapter
 * Routes protocol events into the MSR ledger.
 */

import { logMSREvent } from '../../services/msr.service';
import { ProtocolEvent } from './protocol.types';

export async function recordProtocolEventToMSR(event: ProtocolEvent): Promise<void> {
  await logMSREvent({
    actorId: event.actorId,
    action: 'protocol_event',
    payload: {
      protocolId: event.protocolId,
      phase: event.phase,
      decision: event.decision,
      command: event.command,
    },
  });
}
