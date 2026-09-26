import client from './client';

export interface Photo {
  id: string;
  profile_id: string;
  url: string;
  storage_key: string | null;
  is_primary: boolean;
  visibility: string;
  created_at: string;
}

export type PhotoVisibility = 'public' | 'private' | 'connected_only';

export interface PresignResponse {
  upload_url: string;
  storage_key: string;
  public_url: string;
}

export interface UploadPhotoPayload {
  url: string;
  storage_key?: string;
  is_primary?: boolean;
  visibility?: PhotoVisibility;
}

export const photosApi = {
  list: (profileId: string) =>
    client.get<Photo[]>(`/profiles/${profileId}/photos`),

  presign: (profileId: string, data: { content_type: string; visibility?: PhotoVisibility }) =>
    client.post<PresignResponse>(`/profiles/${profileId}/photos/presign`, data),

  upload: (profileId: string, data: UploadPhotoPayload) =>
    client.post<Photo>(`/profiles/${profileId}/photos`, data),

  update: (profileId: string, photoId: string, data: { is_primary?: boolean; visibility?: string }) =>
    client.patch(`/profiles/${profileId}/photos/${photoId}`, data),

  delete: (profileId: string, photoId: string) =>
    client.delete(`/profiles/${profileId}/photos/${photoId}`),
};
