import axios from 'axios';
import { ApiError } from './apiError';
import type { ApiErrorResponse } from './apiError';

const apiServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiServer.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
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

export default apiServer;
