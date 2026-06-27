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
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  basic_details?: Record<string, unknown>;
  education_career?: Record<string, unknown>;
  family_info?: Record<string, unknown>;
  lifestyle?: Record<string, unknown>;
  location?: Record<string, unknown>;
  photos?: unknown[];
  privacy_settings?: Record<string, unknown>;
  partner_preferences?: Record<string, unknown>;
  kundali?: Record<string, unknown>;
  kundali_preferences?: Record<string, unknown>;
}

export interface MyProfileResponse {
  profile: Profile | null;
  manager: { id: string; role: string } | null;
}

export const profilesApi = {
  create: (data: CreateProfilePayload) =>
    client.post('/profiles', data),

  getMe: () =>
    client.get<MyProfileResponse>('/profiles/me'),

  get: (id: string) =>
    client.get<Profile>(`/profiles/${id}`),

  update: (id: string, data: Partial<CreateProfilePayload> & Record<string, unknown>) =>
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
