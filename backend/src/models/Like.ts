/**
 * Like Model
 * Database schema and types for likes
 */

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: Date;
}

export interface CreateLikeDTO {
  post_id: string;
  user_id: string;
}
