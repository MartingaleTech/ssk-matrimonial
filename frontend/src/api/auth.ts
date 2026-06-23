import client from './client';

export interface RegisterPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: { id: string; email: string | null; phone: string | null };
  token: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    client.post<AuthResponse>('/auth/register', data),

  login: (data: LoginPayload) =>
    client.post<AuthResponse>('/auth/login', data),

  sendOtp: (data: { channel: string; destination: string }) =>
    client.post('/auth/send-otp', data),

  verifyOtp: (data: { user_id: string; code: string; channel: string }) =>
    client.post('/auth/verify-otp', data),

  logout: () => client.post('/auth/logout'),
};
