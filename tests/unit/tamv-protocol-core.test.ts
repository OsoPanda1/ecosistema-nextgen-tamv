import { evaluateProtocol } from '../../backend/src/core/protocols/protocol.engine';
import { nextPhase } from '../../backend/src/core/protocols/protocol.lifecycle';
import { createGuardianEvent } from '../../backend/src/core/protocols/protocol.monitoring.guardian';
import { translateGuardianEventToXR } from '../../backend/src/core/protocols/protocol.visual.xr';

describe('TAMV Protocol Core', () => {
  it('evaluates protocol and advances lifecycle when constitution allows execution', () => {
    const event = evaluateProtocol(
      {
        protocolId: 'future',
        action: 'simulate-scenario',
        payload: { impact: 'education' },
        requestedAt: new Date().toISOString(),
      },
      {
        actorId: 'actor-1',
        layer: 'L2',
        purpose: 'Civil simulation',
      }
    );

    expect(event.actorId).toBe('actor-1');
    expect(event.phase).toBe('review');
    expect(event.decision.phase).toBe('review');
    expect(event.decision.allowed).toBe(true);
  });

  it('keeps deterministic lifecycle transitions', () => {
    expect(nextPhase('init', true)).toBe('review');
    expect(nextPhase('review', true)).toBe('approved');
    expect(nextPhase('approved', true)).toBe('executed');
    expect(nextPhase('executed', true)).toBe('archived');
    expect(nextPhase('approved', false)).toBe('rejected');
  });

  it('projects guardian events into XR-readable scene state', () => {
    const guardianEvent = createGuardianEvent(
      'guardian',
      {
        allowed: false,
        phase: 'rejected',
        reasons: ['ethics_violation'],
        severity: 'critical',
      },
      { actorId: 'guardian-1' }
    );

    const xr = translateGuardianEventToXR(guardianEvent);

    expect(xr.sceneId).toBe('guardian-guardian');
    expect(xr.mood).toBe('critical');
    expect(xr.overlays[0]).toContain('rejected');
  });
});
