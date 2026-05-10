-- Migration: Geolocation core for businesses, stalls, POIs and real-time telemetry

CREATE TABLE IF NOT EXISTS geo_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(160) NOT NULL,
  normalized_name VARCHAR(180) NOT NULL,
  kind VARCHAR(24) NOT NULL CHECK (kind IN ('business', 'stall', 'poi')),
  category VARCHAR(100) NOT NULL,
  address VARCHAR(240),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verification_score NUMERIC(5,4) NOT NULL DEFAULT 0,
  created_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_places_coords ON geo_places (lat, lng);
CREATE INDEX IF NOT EXISTS idx_geo_places_kind_status ON geo_places (kind, status);
CREATE INDEX IF NOT EXISTS idx_geo_places_normalized_name ON geo_places (normalized_name);

CREATE TABLE IF NOT EXISTS geo_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  session_id UUID,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  source VARCHAR(24) NOT NULL CHECK (source IN ('gps', 'wifi', 'beacon', 'manual')),
  accuracy_meters DOUBLE PRECISION,
  speed_kmh DOUBLE PRECISION,
  heading_deg DOUBLE PRECISION,
  observed_at TIMESTAMP NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_telemetry_actor_observed ON geo_telemetry (actor_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_geo_telemetry_coords ON geo_telemetry (lat, lng);

CREATE TABLE IF NOT EXISTS geo_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES geo_places(id) ON DELETE CASCADE,
  verified_by UUID,
  status VARCHAR(24) NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
  confidence NUMERIC(5,4) NOT NULL,
  rationale TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_verifications_place_id ON geo_verifications (place_id);
