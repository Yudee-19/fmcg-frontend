'use client';

import apiClient from './apiClient';
import type {
  ApiResponse,
  ProfileResponse,
  UpdateProfileResponseDto,
  User,
} from '@/types';

type AuthLoginResponse = {
  user: User;
  token: string;
};

type JsonRecord = Record<string, unknown>;

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  oldPassword?: string;
  password?: string;
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthLoginResponse>> {
  const { data } = await apiClient.post<ApiResponse<AuthLoginResponse>>('/users/login', {
    email,
    password,
  });
  return data;
}

export async function register(payload: JsonRecord): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    '/users/register',
    payload
  );
  return data;
}

export async function sendOtp(
  email: string,
  purpose: string,
  updateData?: JsonRecord
): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>('/users/send-otp', {
    email,
    purpose,
    updateData,
  });
  return data;
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    '/users/verify-otp',
    { email, otp }
  );
  return data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    '/users/reset-password',
    { email, otp, newPassword }
  );
  return data;
}

export async function logout(): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>('/users/logout');
  return data;
}

export async function getProfile(): Promise<ApiResponse<ProfileResponse>> {
  const { data } = await apiClient.get<ApiResponse<ProfileResponse>>('/users/profile');
  return data;
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ApiResponse<UpdateProfileResponseDto>> {
  const { data } = await apiClient.post<ApiResponse<UpdateProfileResponseDto>>(
    '/users/update-profile',
    payload
  );
  return data;
}
