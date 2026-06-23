import client from './client';

export interface KundaliData {
  profile_id: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  rashi: string;
  nakshatra: string;
  lagna: string;
  manglik_status: string;
  planetary_positions: Record<string, unknown>;
  houses: Record<string, unknown>;
  doshas: Record<string, unknown>;
  kundali_generated: boolean;
  kundali_source: string;
}

export interface GunaMatchResult {
  id: string;
  profile1_id: string;
  profile2_id: string;
  guna_total_score: number;
  guna_breakdown: Record<string, number>;
  match_quality: string;
  ai_summary: string | null;
  generated_at: string;
}

export const kundaliApi = {
  generate: (data: {
    profile_id: string;
    birth_date: string;
    birth_time: string;
    birth_place: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }) => client.post<KundaliData>('/kundali/generate', data),

  get: (profileId: string) =>
    client.get<KundaliData>(`/kundali/${profileId}`),

  match: (data: { profile1_id: string; profile2_id: string }) =>
    client.post<GunaMatchResult>('/kundali/match', data),

  getMatch: (profileId: string) =>
    client.get<GunaMatchResult[]>(`/kundali/match/${profileId}`),

  getSummary: (profileId: string) =>
    client.get(`/kundali/summary/${profileId}`),

  aiInterpret: (data: { profile_id: string; context?: string }) =>
    client.post('/kundali/ai-interpret', data),

  updatePreferences: (profileId: string, data: Record<string, unknown>) =>
    client.patch(`/profiles/${profileId}/kundali/preferences`, data),

  searchByKundali: (params: Record<string, unknown>) =>
    client.get('/search/kundali', { params }),

  upload: (data: Record<string, unknown>) =>
    client.post('/kundali/upload', data),

  delete: (profileId: string) =>
    client.delete(`/kundali/${profileId}`),
};
