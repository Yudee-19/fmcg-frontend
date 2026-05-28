import apiClient from './apiClient';

export interface RestockResponse {
  success: boolean;
  message?: string;
  error?: { code: string; message: string };
}

export async function subscribeToRestock(productId: string): Promise<RestockResponse> {
  const { data } = await apiClient.post<RestockResponse>(
    `/products/${productId}/notify-restock`
  );
  return data;
}
