'use client';

import apiClient from '../apiClient';
import type { ApiResponse } from '@/types';

export const getUsers = (
  page = 1,
  limit = 20
): Promise<ApiResponse<any>> =>
  apiClient
    .get('/users', { params: { page, limit } })
    .then((res) => res.data);

export const getUserById = (id: string): Promise<ApiResponse<any>> =>
  apiClient.get(`/users/${id}`).then((res) => res.data);

export const updateUser = (
  id: string,
  data: any
): Promise<ApiResponse<any>> =>
  apiClient.put(`/users/${id}`, data).then((res) => res.data);

export const deleteUser = (id: string): Promise<ApiResponse<any>> =>
  apiClient.delete(`/users/${id}`).then((res) => res.data);

export const createAdmin = (payload: {
  username: string;
  email: string;
  password: string;
}): Promise<ApiResponse<any>> =>
  apiClient.post('/users/admin/create', payload).then((res) => res.data);

export const getAdmins = (): Promise<ApiResponse<any>> =>
  apiClient.get('/users/admin/list').then((res) => res.data);

export const getAdminById = (id: string): Promise<ApiResponse<any>> =>
  apiClient.get(`/users/admin/${id}`).then((res) => res.data);

export const updateAdmin = (
  id: string,
  data: any
): Promise<ApiResponse<any>> =>
  apiClient.put(`/users/admin/${id}`, data).then((res) => res.data);

export const deleteAdmin = (id: string): Promise<ApiResponse<any>> =>
  apiClient.delete(`/users/admin/${id}`).then((res) => res.data);
