/**
 * Transaction Model
 * Database schema and types for blockchain transactions
 */

export interface Transaction {
  id: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: 'transfer' | 'mint' | 'buy' | 'sell' | 'stake' | 'unstake';
  from_address: string;
  to_address: string;
  amount: string; // In wei
  token_id?: string; // For NFT transactions
  status: 'pending' | 'confirmed' | 'failed';
  block_number?: number;
  gas_used?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionDTO {
  user_id: string;
  transaction_hash: string;
  transaction_type: 'transfer' | 'mint' | 'buy' | 'sell' | 'stake' | 'unstake';
  from_address: string;
  to_address: string;
  amount: string;
  token_id?: string;
}

export interface UpdateTransactionDTO {
  status: 'pending' | 'confirmed' | 'failed';
  block_number?: number;
  gas_used?: string;
}
