'use client';

import apiClient from './apiClient';
import type { ApiResponse } from '@/types';

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>('/users/login', {
    email,
    password,
  });
  return data;
}

export async function register(payload: any): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>(
    '/users/register',
    payload
  );
  return data;
}

export async function sendOtp(
  email: string,
  purpose: string,
  updateData?: any
): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>('/users/send-otp', {
    email,
    purpose,
    updateData,
  });
  return data;
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>(
    '/users/verify-otp',
    { email, otp }
  );
  return data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>(
    '/users/reset-password',
    { email, otp, newPassword }
  );
  return data;
}

export async function logout(): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>('/users/logout');
  return data;
}

export async function getProfile(): Promise<ApiResponse<any>> {
  const { data } = await apiClient.get<ApiResponse<any>>('/users/profile');
  return data;
}

export async function updateProfile(otp: string): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>(
    '/users/update-profile',
    { otp }
  );
  return data;
}
