import { dignityDecay } from '../services/identity.service';
import { logMSREvent } from '../services/msr.service';

export async function runDignityDecay(): Promise<void> {
  try {
    const affected = await dignityDecay();

    // Log MSR event
    await logMSREvent({
      action: 'DIGNITY_DECAY_RUN',
      payload: {
        affected_count: affected,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Dignity decay completed. Affected: ${affected} identities`);
  } catch (error) {
    console.error('Dignity decay job failed:', error);
    throw error;
  }
}

// Run every 24 hours
export const DIGNITY_DECAY_INTERVAL = 24 * 60 * 60 * 1000;
