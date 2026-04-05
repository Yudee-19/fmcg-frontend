'use client';

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from './apiError';
import type { ApiErrorResponse } from './apiError';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      const data = response.data as ApiErrorResponse;
      throw new ApiError(
        data.error.code,
        data.error.message,
        response.status
      );
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
      }

      const data = error.response?.data as ApiErrorResponse | undefined;
      if (data && data.success === false && data.error) {
        throw new ApiError(
          data.error.code,
          data.error.message,
          error.response?.status ?? 0
        );
      }

      throw new ApiError(
        'NETWORK_ERROR',
        error.message || 'An unexpected network error occurred',
        error.response?.status ?? 0
      );
    }
    throw error;
  }
);

export default apiClient;
