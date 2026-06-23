import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearStorage } from '../utils/storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearStorage();
    }
    return Promise.reject(error);
  },
);

export default client;
