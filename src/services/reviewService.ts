'use client';

import apiClient from './apiClient';
import type { ApiResponse, Review } from '@/types';

export const createReview = (
  productId: string,
  rating: number,
  comment: string
): Promise<ApiResponse<Review>> =>
  apiClient
    .post(`/reviews/${productId}`, { rating, comment })
    .then((res) => res.data);

export const getUserReviews = (): Promise<ApiResponse<Review[]>> =>
  apiClient.get('/reviews/user/reviews').then((res) => res.data);

export const updateReview = (
  reviewId: string,
  data: { rating?: number; comment?: string }
): Promise<ApiResponse<Review>> =>
  apiClient.put(`/reviews/${reviewId}`, data).then((res) => res.data);

export const deleteReview = (reviewId: string): Promise<ApiResponse<any>> =>
  apiClient.delete(`/reviews/${reviewId}`).then((res) => res.data);

export const markReviewHelpful = (
  reviewId: string
): Promise<ApiResponse<any>> =>
  apiClient.post(`/reviews/${reviewId}/helpful`).then((res) => res.data);
