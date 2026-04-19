/**
 * Geolocation Service
 * Real-time geospatial registration, verification and telemetry ingest for RDM Digital.
 */

import pool from '../config/database';
import { logMSREvent } from './msr.service';

export type PlaceKind = 'business' | 'stall' | 'poi';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type TelemetrySource = 'gps' | 'wifi' | 'beacon' | 'manual';

export interface PlaceRegistrationInput {
  actorId: string;
  name: string;
  kind: PlaceKind;
  category: string;
  address?: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  source?: TelemetrySource;
  metadata?: Record<string, unknown>;
}

export interface PlaceRecord {
  id: string;
  name: string;
  normalizedName: string;
  kind: PlaceKind;
  category: string;
  address?: string;
  lat: number;
  lng: number;
  status: VerificationStatus;
  verificationScore: number;
  createdBy: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PlaceCandidate extends PlaceRecord {
  distanceMeters: number;
}

export interface TelemetryInput {
  actorId?: string;
  sessionId?: string;
  lat: number;
  lng: number;
  source: TelemetrySource;
  accuracyMeters?: number;
  speedKmh?: number;
  headingDeg?: number;
  observedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetryRecord extends TelemetryInput {
  id: string;
  observedAt: string;
  createdAt: string;
}

export function normalizePlaceName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function haversineDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const earthRadius = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const q =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

export function computeVerificationScore(input: {
  accuracyMeters?: number;
  source?: TelemetrySource;
  hasMediaEvidence?: boolean;
  duplicateDistanceMeters?: number;
}): number {
  const accuracy = input.accuracyMeters ?? 50;
  const source = input.source ?? 'manual';

  let score = 0.45;
  score += Math.max(0, 0.35 - accuracy / 200);

  if (source === 'gps') score += 0.12;
  if (source === 'wifi') score += 0.06;
  if (source === 'beacon') score += 0.1;
  if (input.hasMediaEvidence) score += 0.08;
  if (typeof input.duplicateDistanceMeters === 'number' && input.duplicateDistanceMeters < 15) score -= 0.2;

  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

export async function findNearbyPlaces(lat: number, lng: number, radiusMeters = 250): Promise<PlaceCandidate[]> {
  const result = await pool.query<PlaceCandidate>(
    `SELECT
      id,
      name,
      normalized_name as "normalizedName",
      kind,
      category,
      address,
      lat,
      lng,
      status,
      verification_score as "verificationScore",
      created_by as "createdBy",
      metadata,
      created_at as "createdAt",
      (6371000 * acos(
        least(1, greatest(-1,
          cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2))
          + sin(radians($1)) * sin(radians(lat))
        ))
      )) as "distanceMeters"
    FROM geo_places
    WHERE status IN ('pending', 'verified')
    ORDER BY "distanceMeters" ASC
    LIMIT 50`,
    [lat, lng]
  );

  return result.rows.filter(place => place.distanceMeters <= radiusMeters);
}

export async function registerPlace(input: PlaceRegistrationInput): Promise<{
  place: PlaceRecord;
  duplicateCandidates: PlaceCandidate[];
}> {
  const normalizedName = normalizePlaceName(input.name);
  const nearby = await findNearbyPlaces(input.lat, input.lng, 50);

  const duplicates = nearby.filter(candidate => candidate.normalizedName === normalizedName);
  const duplicateDistance = duplicates.length > 0 ? duplicates[0].distanceMeters : undefined;

  const verificationScore = computeVerificationScore({
    accuracyMeters: input.accuracyMeters,
    source: input.source,
    hasMediaEvidence: Boolean(input.metadata?.mediaEvidence),
    duplicateDistanceMeters: duplicateDistance,
  });

  const status: VerificationStatus = verificationScore >= 0.78 ? 'verified' : 'pending';

  const insertResult = await pool.query<PlaceRecord>(
    `INSERT INTO geo_places (
      name,
      normalized_name,
      kind,
      category,
      address,
      lat,
      lng,
      status,
      verification_score,
      created_by,
      metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING
      id,
      name,
      normalized_name as "normalizedName",
      kind,
      category,
      address,
      lat,
      lng,
      status,
      verification_score as "verificationScore",
      created_by as "createdBy",
      metadata,
      created_at as "createdAt"`,
    [
      input.name,
      normalizedName,
      input.kind,
      input.category,
      input.address || null,
      input.lat,
      input.lng,
      status,
      verificationScore,
      input.actorId,
      input.metadata || {},
    ]
  );

  const place = insertResult.rows[0];

  await pool.query(
    `INSERT INTO geo_verifications (place_id, verified_by, status, confidence, rationale)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      place.id,
      input.actorId,
      status,
      verificationScore,
      duplicates.length > 0 ? 'Duplicate proximity detected; requires review.' : 'Initial automated geospatial verification.',
    ]
  );

  await logMSREvent({
    actor_id: input.actorId,
    action: 'geo.place_registered',
    payload: {
      placeId: place.id,
      kind: place.kind,
      status: place.status,
      verificationScore: place.verificationScore,
      duplicateCandidates: duplicates.map(candidate => ({ id: candidate.id, distanceMeters: candidate.distanceMeters })),
    },
  });

  return { place, duplicateCandidates: duplicates };
}

export async function ingestTelemetry(input: TelemetryInput): Promise<{
  telemetry: TelemetryRecord;
  nearbyPlaces: PlaceCandidate[];
}> {
  const observedAt = input.observedAt || new Date().toISOString();

  const result = await pool.query<TelemetryRecord>(
    `INSERT INTO geo_telemetry (
      actor_id,
      session_id,
      lat,
      lng,
      source,
      accuracy_meters,
      speed_kmh,
      heading_deg,
      observed_at,
      metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING
      id,
      actor_id as "actorId",
      session_id as "sessionId",
      lat,
      lng,
      source,
      accuracy_meters as "accuracyMeters",
      speed_kmh as "speedKmh",
      heading_deg as "headingDeg",
      observed_at as "observedAt",
      metadata,
      created_at as "createdAt"`,
    [
      input.actorId || null,
      input.sessionId || null,
      input.lat,
      input.lng,
      input.source,
      input.accuracyMeters || null,
      input.speedKmh || null,
      input.headingDeg || null,
      observedAt,
      input.metadata || {},
    ]
  );

  const telemetry = result.rows[0];
  const nearbyPlaces = await findNearbyPlaces(input.lat, input.lng, 300);

  if (input.actorId) {
    await logMSREvent({
      actor_id: input.actorId,
      action: 'geo.telemetry_ingested',
      payload: {
        telemetryId: telemetry.id,
        lat: telemetry.lat,
        lng: telemetry.lng,
        source: telemetry.source,
        nearbyCount: nearbyPlaces.length,
      },
    });
  }

  return { telemetry, nearbyPlaces };
}
