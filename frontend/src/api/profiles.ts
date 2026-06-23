import client from './client';

export interface CreateProfilePayload {
  display_name: string;
  gender: string;
  date_of_birth: string;
  height_cm: number;
  marital_status: string;
  about_me?: string;
}

export interface Profile {
  id: string;
  display_name: string;
  gender: string;
  date_of_birth: string;
  height_cm: number;
  marital_status: string;
  about_me: string | null;
  profile_status: string;
  has_kundali: boolean;
  created_at: string;
  updated_at: string;
}

export const profilesApi = {
  create: (data: CreateProfilePayload) =>
    client.post('/profiles', data),

  get: (id: string) =>
    client.get<Profile>(`/profiles/${id}`),

  update: (id: string, data: Partial<CreateProfilePayload>) =>
    client.patch(`/profiles/${id}`, data),

  delete: (id: string) =>
    client.delete(`/profiles/${id}`),

  updateBasic: (id: string, data: Record<string, unknown>) =>
    client.patch(`/profiles/${id}/basic`, data),

  updateEducationCareer: (id: string, data: Record<string, unknown>) =>
    client.patch(`/profiles/${id}/education-career`, data),

  updateFamilyInfo: (id: string, data: Record<string, unknown>) =>
    client.patch(`/profiles/${id}/family-info`, data),

  updateLifestyle: (id: string, data: Record<string, unknown>) =>
    client.patch(`/profiles/${id}/lifestyle`, data),

  updateLocation: (id: string, data: Record<string, unknown>) =>
    client.patch(`/profiles/${id}/location`, data),

  updateKundali: (id: string, data: Record<string, unknown>) =>
    client.patch(`/profiles/${id}/kundali`, data),
};
