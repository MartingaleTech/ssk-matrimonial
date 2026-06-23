import client from './client';

export const verificationApi = {
  email: (data: { profile_id: string }) =>
    client.post('/verification/email', data),

  phone: (data: { profile_id: string }) =>
    client.post('/verification/phone', data),

  document: (data: { profile_id: string; type: string; metadata?: Record<string, unknown> }) =>
    client.post('/verification/document', data),

  status: (params: { profile_id: string }) =>
    client.get('/verification/status', { params }),
};
