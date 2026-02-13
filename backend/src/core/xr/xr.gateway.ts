/**
 * XR Gateway
 * WebSocket/SSE gateway integration for real-time XR communication.
 */

import { XRSceneUpdate } from '../protocols/protocol.types';

export type XRGatewayMessageType = 
  | 'session_created'
  | 'session_updated'
  | 'session_ended'
  | 'scene_created'
  | 'scene_updated'
  | 'scene_loaded'
  | 'scene_enhanced'
  | 'event_received'
  | 'error';

export interface XRGatewayMessage {
  type: XRGatewayMessageType;
  payload: Record<string, unknown>;
  createdAt: string;
  sessionId?: string;
  sceneId?: string;
}

export function buildXRGatewayMessage(
  type: XRGatewayMessageType,
  payload: Record<string, unknown>,
  options?: { sessionId?: string; sceneId?: string }
): XRGatewayMessage {
  return {
    type,
    payload,
    createdAt: new Date().toISOString(),
    ...options,
  };
}

export function buildSceneUpdateMessage(
  update: XRSceneUpdate,
  sessionId?: string
): XRGatewayMessage {
  return {
    type: 'scene_updated',
    payload: update,
    createdAt: new Date().toISOString(),
    sceneId: update.sceneId,
    sessionId,
  };
}

export function buildSessionMessage(
  type: 'session_created' | 'session_updated' | 'session_ended',
  sessionId: string,
  payload: Record<string, unknown>
): XRGatewayMessage {
  return {
    type,
    payload,
    createdAt: new Date().toISOString(),
    sessionId,
  };
}

export function buildErrorResponse(
  error: string,
  options?: { sessionId?: string; sceneId?: string }
): XRGatewayMessage {
  return {
    type: 'error',
    payload: { error },
    createdAt: new Date().toISOString(),
    ...options,
  };
}
