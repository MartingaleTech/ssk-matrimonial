import client from './client';

export interface ChatThread {
  id: string;
  profile1_id: string;
  profile2_id: string;
  created_at: string;
  last_message_at: string | null;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_profile_id: string;
  sender_manager_id: string;
  message_type: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export const chatApi = {
  getThreads: (profileId: string) =>
    client.get<ChatThread[]>('/chat/threads', { params: { profile_id: profileId } }),

  createThread: (data: { profile1_id: string; profile2_id: string }) =>
    client.post<ChatThread>('/chat/threads', data),

  getMessages: (threadId: string, params?: { page?: number; limit?: number }) =>
    client.get<{ messages: ChatMessage[]; total: number }>(
      `/chat/threads/${threadId}/messages`,
      { params },
    ),

  sendMessage: (threadId: string, data: { content: string; profile_id: string; message_type?: string }) =>
    client.post<ChatMessage>(`/chat/threads/${threadId}/messages`, data),

  markAsRead: (messageId: string) =>
    client.patch(`/chat/messages/${messageId}/read`),
};
