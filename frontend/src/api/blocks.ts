import client from './client';

export interface Block {
  id: string;
  blocked_by_profile_id: string;
  blocked_profile_id: string;
  reason: string | null;
  created_at: string;
}

export const blocksApi = {
  block: (data: { blocked_by_profile_id: string; blocked_profile_id: string; reason?: string }) =>
    client.post('/blocks', data),

  unblock: (id: string) =>
    client.delete(`/blocks/${id}`),
};
