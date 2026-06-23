import client from './client';

export interface Connection {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  status: string;
  initiated_by_manager_id: string;
  requested_at: string;
  responded_at: string | null;
  message: string | null;
}

export const connectionsApi = {
  send: (data: { from_profile_id: string; to_profile_id: string; message?: string }) =>
    client.post('/connections', data),

  accept: (id: string, data: { profile_id: string }) =>
    client.patch(`/connections/${id}/accept`, data),

  reject: (id: string, data: { profile_id: string }) =>
    client.patch(`/connections/${id}/reject`, data),

  cancel: (id: string, data: { profile_id: string }) =>
    client.patch(`/connections/${id}/cancel`, data),

  list: (params?: { profile_id?: string; status?: string }) =>
    client.get<Connection[]>('/connections', { params }),
};
