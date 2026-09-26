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

  sendOtp: (data: { email?: string; phone?: string; channel: string }) =>
    client.post('/auth/send-otp', data),

  verifyOtp: (data: { email?: string; phone?: string; code: string }) =>
    client.post('/auth/verify-otp', data),

  forgotPassword: (data: { email?: string; phone?: string }) =>
    client.post('/auth/forgot-password', data),

  resetPassword: (data: {
    email?: string;
    phone?: string;
    code: string;
    new_password: string;
  }) => client.post<AuthResponse>('/auth/reset-password', data),

  logout: (all = false) => client.post('/auth/logout', { all }),
};
