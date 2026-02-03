/**
 * Comment Model
 * Database schema and types for comments
 */

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string; // For nested comments
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateCommentDTO {
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface UpdateCommentDTO {
  content: string;
}

export interface CommentWithUser extends Comment {
  username: string;
  display_name?: string;
  avatar?: string;
}
