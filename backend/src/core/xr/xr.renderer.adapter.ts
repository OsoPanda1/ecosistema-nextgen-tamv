/**
 * XR Renderer Adapter
 * Maps protocol/XR events into renderer-friendly payloads.
 */

import { XRSceneUpdate } from '../protocols/protocol.types';

export interface XRRenderPayload {
  sceneId: string;
  mood: XRSceneUpdate['mood'];
  overlays: string[];
  timestamp: string;
}

export function toXRRenderPayload(update: XRSceneUpdate): XRRenderPayload {
  return {
    sceneId: update.sceneId,
    mood: update.mood,
    overlays: update.overlays,
    timestamp: update.updatedAt,
  };
}
