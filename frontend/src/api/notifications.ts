import client from './client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: () => client.get<Notification[]>('/notifications'),

  markAsRead: (id: string) =>
    client.patch(`/notifications/${id}/read`),
};
