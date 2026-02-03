export interface MSREvent {
  id: string;
  actor_id: string | null;
  action: string;
  payload: Record<string, any>;
  hash: string;
  created_at: Date;
}

export interface CreateMSREventDTO {
  actor_id?: string;
  action: string;
  payload: Record<string, any>;
}
