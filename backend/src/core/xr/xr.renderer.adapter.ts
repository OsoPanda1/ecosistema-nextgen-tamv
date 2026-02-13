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
  quantumEnhanced?: boolean;
  quantumScore?: number;
  sessionId?: string;
}

export interface XRSessionRenderPayload {
  sessionId: string;
  status: string;
  sessionType: string;
  currentSceneId?: string;
  timestamp: string;
}

export interface XRSceneRenderPayload {
  sceneId: string;
  name: string;
  type: string;
  description?: string;
  initialPayload?: Record<string, unknown>;
  timestamp: string;
}

export function toXRRenderPayload(update: XRSceneUpdate & { sessionId?: string; quantumEnhanced?: boolean; quantumScore?: number }): XRRenderPayload {
  return {
    sceneId: update.sceneId,
    mood: update.mood,
    overlays: update.overlays,
    timestamp: update.updatedAt,
    quantumEnhanced: update.quantumEnhanced,
    quantumScore: update.quantumScore,
    sessionId: update.sessionId,
  };
}

export function toXRSessionRenderPayload(session: any): XRSessionRenderPayload {
  return {
    sessionId: session.id,
    status: session.status,
    sessionType: session.sessionType,
    currentSceneId: session.currentSceneId,
    timestamp: session.updatedAt || session.createdAt,
  };
}

export function toXRSceneRenderPayload(scene: any): XRSceneRenderPayload {
  return {
    sceneId: scene.id,
    name: scene.name,
    type: scene.type,
    description: scene.description,
    initialPayload: scene.initialPayload,
    timestamp: scene.updatedAt || scene.createdAt,
  };
}
