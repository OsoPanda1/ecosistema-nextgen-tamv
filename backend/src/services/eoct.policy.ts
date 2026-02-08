/**
 * EOCT Policy Engine
 * Converts signals into ethical verdicts.
 */

export interface EOCTSignals {
  coercionRisk?: number;
  harmRisk?: number;
  privacyRisk?: number;
  transparencyRisk?: number;
  legalRisk?: number;
}

export interface EOCTPolicyResult {
  score: number;
  verdict: 'approved' | 'rejected' | 'review';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function evaluateEOCTPolicy(signals: EOCTSignals): EOCTPolicyResult {
  const coercion = clamp(signals.coercionRisk ?? 0);
  const harm = clamp(signals.harmRisk ?? 0);
  const privacy = clamp(signals.privacyRisk ?? 0);
  const transparency = clamp(signals.transparencyRisk ?? 0);
  const legal = clamp(signals.legalRisk ?? 0);

  const combinedRisk = clamp(
    coercion * 0.25 + harm * 0.25 + privacy * 0.2 + transparency * 0.15 + legal * 0.15
  );

  const score = clamp(1 - combinedRisk);
  const reasons: string[] = [];

  if (coercion > 0.6) reasons.push('coercion_risk');
  if (harm > 0.6) reasons.push('harm_risk');
  if (privacy > 0.6) reasons.push('privacy_risk');
  if (transparency > 0.6) reasons.push('transparency_risk');
  if (legal > 0.6) reasons.push('legal_risk');

  let verdict: EOCTPolicyResult['verdict'] = 'approved';
  let riskLevel: EOCTPolicyResult['riskLevel'] = 'low';

  if (combinedRisk > 0.8) {
    verdict = 'rejected';
    riskLevel = 'critical';
  } else if (combinedRisk > 0.6) {
    verdict = 'review';
    riskLevel = 'high';
  } else if (combinedRisk > 0.4) {
    verdict = 'review';
    riskLevel = 'medium';
  }

  return { score, verdict, riskLevel, reasons };
}
