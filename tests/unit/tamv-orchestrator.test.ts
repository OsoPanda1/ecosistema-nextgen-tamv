jest.mock('../../backend/src/services/eoct.service', () => ({
  createEOCTEvaluation: jest.fn().mockResolvedValue({ id: 'eoct-1' }),
}));

jest.mock('../../backend/src/services/isabella.service', () => ({
  createIsabellaDecision: jest.fn().mockResolvedValue({ id: 'isa-1' }),
}));

jest.mock('../../backend/src/services/msr.service', () => ({
  logMSREvent: jest.fn().mockResolvedValue({ id: 'msr-1' }),
}));

jest.mock('../../backend/src/services/bookpi.service', () => ({
  createBookPIEntry: jest.fn().mockResolvedValue({ id: 'book-1' }),
}));

jest.mock('../../backend/src/services/xr.service', () => ({
  createXREvent: jest.fn().mockResolvedValue({ id: 'xr-1' }),
}));

import { executeProtocolCommand } from '../../backend/src/core/protocols/protocol.orchestrator';
import { createEOCTEvaluation } from '../../backend/src/services/eoct.service';
import { createIsabellaDecision } from '../../backend/src/services/isabella.service';
import { logMSREvent } from '../../backend/src/services/msr.service';
import { createBookPIEntry } from '../../backend/src/services/bookpi.service';
import { createXREvent } from '../../backend/src/services/xr.service';

describe('TAMV Protocol Orchestrator', () => {
  it('executes and fans out to EOCT, Isabella, MSR, BookPI and XR adapters', async () => {
    const result = await executeProtocolCommand(
      {
        protocolId: 'economy',
        action: 'allocate-contribution-credit',
        payload: { amount: 50, currency: 'TAMV-CREDIT' },
        requestedAt: new Date().toISOString(),
      },
      {
        actorId: 'user-1',
        layer: 'L5',
        purpose: 'Credit contribution work',
      }
    );

    expect(result.event.protocolId).toBe('economy');
    expect(result.guardianEventId).toBeTruthy();
    expect(result.xrSceneId).toBe('guardian-economy');

    expect(createEOCTEvaluation).toHaveBeenCalledTimes(1);
    expect(createIsabellaDecision).toHaveBeenCalledTimes(1);
    expect(logMSREvent).toHaveBeenCalledTimes(1);
    expect(createBookPIEntry).toHaveBeenCalledTimes(1);
    expect(createXREvent).toHaveBeenCalledTimes(1);
  });
});
