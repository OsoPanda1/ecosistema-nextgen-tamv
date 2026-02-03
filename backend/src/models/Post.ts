/**
 * Post Model
 * Database schema and types for posts
 */

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  visibility: 'public' | 'followers' | 'private';
  like_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreatePostDTO {
  user_id: string;
  content: string;
  media_urls?: string[];
  visibility?: 'public' | 'followers' | 'private';
}

export interface UpdatePostDTO {
  content?: string;
  media_urls?: string[];
  visibility?: 'public' | 'followers' | 'private';
}

export interface PostWithUser extends Post {
  username: string;
  display_name?: string;
  avatar?: string;
}
