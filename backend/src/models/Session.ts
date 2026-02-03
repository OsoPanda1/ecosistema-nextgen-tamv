/**
 * Session Model
 * Database schema and types for user sessions
 */

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
}

export interface CreateSessionDTO {
  user_id: string;
  token: string;
  refresh_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
}
