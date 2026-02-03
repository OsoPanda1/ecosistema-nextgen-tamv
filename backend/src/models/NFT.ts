/**
 * NFT Model
 * Database schema and types for NFTs
 */

export interface NFT {
  id: string;
  token_id: string;
  contract_address: string;
  owner_address: string;
  creator_id: string;
  name: string;
  description?: string;
  image_url: string;
  metadata_uri: string;
  price?: string; // In wei
  is_listed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNFTDTO {
  token_id: string;
  contract_address: string;
  owner_address: string;
  creator_id: string;
  name: string;
  description?: string;
  image_url: string;
  metadata_uri: string;
}

export interface UpdateNFTDTO {
  owner_address?: string;
  price?: string;
  is_listed?: boolean;
}

export interface NFTWithCreator extends NFT {
  creator_username: string;
  creator_display_name?: string;
}
