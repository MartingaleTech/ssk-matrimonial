import client from './client';

export interface Favorite {
  id: string;
  profile_id: string;
  favorited_profile_id: string;
  created_at: string;
  favorited_profile?: {
    id: string;
    display_name: string;
    gender: string;
    height_cm: number;
    marital_status: string;
  };
}

export const favoritesApi = {
  list: (profileId: string) =>
    client.get<Favorite[]>('/favorites', { params: { profile_id: profileId } }),

  add: (data: { profile_id: string; favorited_profile_id: string }) =>
    client.post<Favorite>('/favorites', data),

  remove: (profileId: string, favoritedProfileId: string) =>
    client.delete<{ message: string }>(`/favorites/${favoritedProfileId}`, {
      params: { profile_id: profileId },
    }),
};
