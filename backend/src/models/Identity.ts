export interface Identity {
  id: string;
  user_id: string;
  dignity_score: number;
  reputation: number;
  immutable_username: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateIdentityDTO {
  user_id: string;
  dignity_score?: number;
  reputation?: number;
}

export interface UpdateIdentityDTO {
  dignity_score?: number;
  reputation?: number;
}
