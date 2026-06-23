import client from './client';

export interface PartnerPreferences {
  profile_id: string;
  age_min: number | null;
  age_max: number | null;
  height_min_cm: number | null;
  height_max_cm: number | null;
  marital_status_allowed: string[] | null;
  education_levels: string[] | null;
  occupations: string[] | null;
  locations: string[] | null;
  diet_preferences: string[] | null;
  smoking_preference: string | null;
  drinking_preference: string | null;
  kundali_requirements: Record<string, unknown> | null;
}

export const preferencesApi = {
  get: (profileId: string) =>
    client.get<PartnerPreferences>(`/profiles/${profileId}/preferences`),

  update: (profileId: string, data: Partial<PartnerPreferences>) =>
    client.patch(`/profiles/${profileId}/preferences`, data),
};
