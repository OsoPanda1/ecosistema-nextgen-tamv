/**
 * TAMV Protocol Types
 * Canonical contracts for protocol execution and federation events.
 */

export type ProtocolId =
  | 'fenix'
  | 'hoyo-negro'
  | 'future'
  | 'eoct'
  | 'guardian'
  | 'isabella'
  | 'economy'
  | 'xr'
  | 'dreamspaces';

export type ProtocolPhase =
  | 'init'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'archived';

export type ProtocolSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProtocolContext {
  actorId: string;
  layer: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7';
  purpose: string;
  metadata?: Record<string, unknown>;
}

export interface ProtocolCommand {
  protocolId: ProtocolId;
  action: string;
  payload: Record<string, unknown>;
  requestedAt: string;
}

export interface ProtocolDecision {
  allowed: boolean;
  phase: ProtocolPhase;
  reasons: string[];
  severity: ProtocolSeverity;
}

export interface ProtocolEvent {
  id: string;
  actorId: string;
  protocolId: ProtocolId;
  phase: ProtocolPhase;
  command: ProtocolCommand;
  decision: ProtocolDecision;
  createdAt: string;
}

export interface GuardianEvent {
  id: string;
  protocolId: ProtocolId;
  threatLevel: ProtocolSeverity;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface XRSceneUpdate {
  sceneId: string;
  mood: 'calm' | 'alert' | 'critical';
  overlays: string[];
  updatedAt: string;
}
