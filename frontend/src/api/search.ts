import client from './client';

export interface SearchParams {
  gender?: string;
  age_min?: number;
  age_max?: number;
  height_min_cm?: number;
  height_max_cm?: number;
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  city?: string;
  state?: string;
  country?: string;
  community?: string;
  page?: number;
  limit?: number;
}

export const searchApi = {
  search: (params: SearchParams) =>
    client.get('/search', { params }),

  recommended: (params?: { profile_id?: string; page?: number; limit?: number }) =>
    client.get('/matches/recommended', { params }),

  topMatches: (params?: { profile_id?: string; page?: number; limit?: number }) =>
    client.get('/matches/top', { params }),
};
