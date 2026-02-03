-- Migration: Create nfts table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id VARCHAR(100) NOT NULL,
  contract_address VARCHAR(42) NOT NULL, -- Ethereum address
  owner_address VARCHAR(42) NOT NULL, -- Ethereum address
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  price VARCHAR(100), -- In wei (string to handle large numbers)
  is_listed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contract_address, token_id)
);

-- Indexes
CREATE INDEX idx_nfts_token_id ON nfts(token_id);
CREATE INDEX idx_nfts_contract_address ON nfts(contract_address);
CREATE INDEX idx_nfts_owner_address ON nfts(owner_address);
CREATE INDEX idx_nfts_creator_id ON nfts(creator_id);
CREATE INDEX idx_nfts_is_listed ON nfts(is_listed) WHERE is_listed = true;
CREATE INDEX idx_nfts_created_at ON nfts(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rollback
-- DROP TRIGGER IF EXISTS update_nfts_updated_at ON nfts;
-- DROP TABLE IF EXISTS nfts CASCADE;
