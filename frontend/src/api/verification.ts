import client from './client';

export type ContactChannel = 'email' | 'phone';

export const verificationApi = {
  sendOtp: (data: { profile_id: string; channel: ContactChannel }) =>
    client.post('/verification/send-otp', data),

  email: (data: { profile_id: string; code: string }) =>
    client.post('/verification/email', data),

  phone: (data: { profile_id: string; code: string }) =>
    client.post('/verification/phone', data),

  document: (data: { profile_id: string; document_url: string; document_type?: string; metadata?: Record<string, unknown> }) =>
    client.post('/verification/document', data),

  status: (params: { profile_id: string }) =>
    client.get('/verification/status', { params }),
};
