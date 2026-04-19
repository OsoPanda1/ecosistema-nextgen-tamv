import {
  normalizePlaceName,
  haversineDistanceMeters,
  computeVerificationScore,
} from '../../backend/src/services/geolocation.service';

describe('Geolocation Service Helpers', () => {
  it('normalizes place names removing accents and punctuation', () => {
    const normalized = normalizePlaceName('  Café El-Minar #1  ');
    expect(normalized).toBe('CAFE EL MINAR 1');
  });

  it('computes near-zero distance for identical coordinates', () => {
    const d = haversineDistanceMeters({ lat: 20.1387, lng: -98.6731 }, { lat: 20.1387, lng: -98.6731 });
    expect(d).toBeLessThan(0.01);
  });

  it('scores gps+accurate higher than manual+imprecise', () => {
    const high = computeVerificationScore({ accuracyMeters: 4, source: 'gps', hasMediaEvidence: true });
    const low = computeVerificationScore({ accuracyMeters: 120, source: 'manual', hasMediaEvidence: false });

    expect(high).toBeGreaterThan(low);
    expect(high).toBeLessThanOrEqual(1);
    expect(low).toBeGreaterThanOrEqual(0);
  });

  it('penalizes likely duplicates in close proximity', () => {
    const baseline = computeVerificationScore({ accuracyMeters: 6, source: 'gps' });
    const penalized = computeVerificationScore({
      accuracyMeters: 6,
      source: 'gps',
      duplicateDistanceMeters: 4,
    });

    expect(penalized).toBeLessThan(baseline);
  });
});
