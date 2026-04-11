'use client';

import apiClient from '../apiClient';
import type { ApiResponse, Product, ProductDetailApiResponse } from '@/types';

export const createProduct = (
  formData: FormData
): Promise<ApiResponse<Product>> =>
  apiClient
    .post('/products', formData, {
      headers: { 'Content-Type': undefined as any },
    })
    .then((res) => res.data);

export const updateProduct = (
  id: string,
  data: any
): Promise<ApiResponse<Product>> =>
  apiClient
    .put(`/products/${id}`, data, data instanceof FormData
      ? { headers: { 'Content-Type': undefined as any } }
      : undefined)
    .then((res) => res.data);

export const getAdminProduct = (
  id: string
): Promise<ProductDetailApiResponse> =>
  apiClient.get(`/products/${id}`).then((res) => res.data);

export const deleteProduct = (id: string): Promise<ApiResponse<any>> =>
  apiClient.delete(`/products/${id}`).then((res) => res.data);

export const bulkUpdateProducts = (data: any): Promise<ApiResponse<any>> =>
  apiClient.post('/products/bulk-update', data).then((res) => res.data);

export const bulkCreateProducts = (
  products: any[]
): Promise<ApiResponse<any>> =>
  apiClient
    .post('/products/bulk-create', { products })
    .then((res) => res.data);

export const fetchAndStoreProducts = (): Promise<ApiResponse<any>> =>
  apiClient.post('/products/fetch-store').then((res) => res.data);

export const updateExistingProducts = (): Promise<ApiResponse<any>> =>
  apiClient.post('/products/update-existing').then((res) => res.data);

export const cleanProductData = (): Promise<ApiResponse<any>> =>
  apiClient.post('/products/clean-data').then((res) => res.data);
