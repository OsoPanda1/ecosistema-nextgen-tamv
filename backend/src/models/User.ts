/**
 * User Model
 * Database schema and types for users
 */

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: 'user' | 'moderator' | 'admin';
  display_name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  wallet_address?: string; // For blockchain integration
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  display_name?: string;
}

export interface UpdateUserDTO {
  display_name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export interface UserPublic {
  id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  created_at: Date;
}
