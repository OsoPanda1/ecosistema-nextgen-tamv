/**
 * XR Visual translation for Guardian events.
 */

import { GuardianEvent, XRSceneUpdate } from './protocol.types';

export function translateGuardianEventToXR(event: GuardianEvent): XRSceneUpdate {
  const mood = event.threatLevel === 'critical'
    ? 'critical'
    : event.threatLevel === 'high'
      ? 'alert'
      : 'calm';

  return {
    sceneId: `guardian-${event.protocolId}`,
    mood,
    overlays: [event.summary],
    updatedAt: new Date().toISOString(),
  };
}
