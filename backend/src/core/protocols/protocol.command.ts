/**
 * Protocol command factory.
 */

import { ProtocolCommand, ProtocolId } from './protocol.types';

export function createProtocolCommand(
  protocolId: ProtocolId,
  action: string,
  payload: Record<string, unknown>
): ProtocolCommand {
  return {
    protocolId,
    action,
    payload,
    requestedAt: new Date().toISOString(),
  };
}
