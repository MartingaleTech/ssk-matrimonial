import client from './client';

export interface Photo {
  id: string;
  profile_id: string;
  url: string;
  is_primary: boolean;
  visibility: string;
  created_at: string;
}

export const photosApi = {
  list: (profileId: string) =>
    client.get<Photo[]>(`/profiles/${profileId}/photos`),

  upload: (profileId: string, data: { url: string; is_primary?: boolean; visibility?: string }) =>
    client.post(`/profiles/${profileId}/photos`, data),

  update: (profileId: string, photoId: string, data: { is_primary?: boolean; visibility?: string }) =>
    client.patch(`/profiles/${profileId}/photos/${photoId}`, data),

  delete: (profileId: string, photoId: string) =>
    client.delete(`/profiles/${profileId}/photos/${photoId}`),
};
