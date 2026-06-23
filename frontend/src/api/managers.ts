import client from './client';

export interface Manager {
  id: string;
  user_id: string;
  profile_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
}

export interface AddManagerPayload {
  email?: string;
  phone?: string;
  role: string;
}

export const managersApi = {
  list: (profileId: string) =>
    client.get<Manager[]>(`/profiles/${profileId}/managers`),

  add: (profileId: string, data: AddManagerPayload) =>
    client.post(`/profiles/${profileId}/managers`, data),

  update: (profileId: string, managerId: string, data: { role: string }) =>
    client.patch(`/profiles/${profileId}/managers/${managerId}`, data),

  remove: (profileId: string, managerId: string) =>
    client.delete(`/profiles/${profileId}/managers/${managerId}`),
};
