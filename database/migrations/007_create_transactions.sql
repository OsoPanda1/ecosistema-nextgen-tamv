-- Migration: Create transactions table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_hash VARCHAR(66) NOT NULL UNIQUE, -- Ethereum tx hash
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('transfer', 'mint', 'buy', 'sell', 'stake', 'unstake')),
  from_address VARCHAR(42) NOT NULL, -- Ethereum address
  to_address VARCHAR(42) NOT NULL, -- Ethereum address
  amount VARCHAR(100) NOT NULL, -- In wei (string to handle large numbers)
  token_id VARCHAR(100), -- For NFT transactions
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  block_number BIGINT,
  gas_used VARCHAR(100), -- In wei
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_transaction_hash ON transactions(transaction_hash);
CREATE INDEX idx_transactions_from_address ON transactions(from_address);
CREATE INDEX idx_transactions_to_address ON transactions(to_address);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rollback
-- DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
-- DROP TABLE IF EXISTS transactions CASCADE;
