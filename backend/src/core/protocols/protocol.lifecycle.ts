/**
 * Protocol lifecycle helpers.
 */

import { ProtocolPhase } from './protocol.types';

export function nextPhase(current: ProtocolPhase, allowed: boolean): ProtocolPhase {
  if (!allowed) {
    return 'rejected';
  }

  switch (current) {
    case 'init':
      return 'review';
    case 'review':
      return 'approved';
    case 'approved':
      return 'executed';
    case 'executed':
      return 'archived';
    case 'rejected':
    case 'archived':
    default:
      return current;
  }
}
