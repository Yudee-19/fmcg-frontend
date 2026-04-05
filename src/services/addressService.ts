'use client';

import apiClient from './apiClient';
import type { ApiResponse, Address } from '@/types';

export const getAddresses = (): Promise<ApiResponse<Address[]>> =>
  apiClient.get('/addresses').then((res) => res.data);

export const createAddress = (payload: {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  addressType?: 'home' | 'work' | 'billing' | 'shipping';
}): Promise<ApiResponse<Address>> =>
  apiClient.post('/addresses', payload).then((res) => res.data);

export const updateAddress = (
  addressId: string,
  payload: Partial<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    addressType: 'home' | 'work' | 'billing' | 'shipping';
  }>
): Promise<ApiResponse<Address>> =>
  apiClient.put(`/addresses/${addressId}`, payload).then((res) => res.data);

export const deleteAddress = (
  addressId: string
): Promise<ApiResponse<any>> =>
  apiClient.delete(`/addresses/${addressId}`).then((res) => res.data);

export const setDefaultAddress = (
  addressId: string
): Promise<ApiResponse<Address>> =>
  apiClient
    .patch(`/addresses/${addressId}/set-default`)
    .then((res) => res.data);
