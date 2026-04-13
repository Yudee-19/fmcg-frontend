'use client';

import apiClient from './apiClient';
import type { ApiResponse, Ticket } from '@/types';

export interface CreateTicketPayload {
  subject: string;
  category: Ticket['category'];
  priority: Ticket['priority'];
  message: string;
  orderId?: string;
}

export interface GetTicketsParams {
  page?: number;
  limit?: number;
}

export const createTicket = (
  payload: CreateTicketPayload
): Promise<ApiResponse<Ticket>> =>
  apiClient.post('/tickets', payload).then((res) => res.data);

export const getTickets = (
  params?: GetTicketsParams
): Promise<ApiResponse<Ticket[]>> =>
  apiClient.get('/tickets', { params }).then((res) => res.data);

export const getTicket = (ticketId: string): Promise<ApiResponse<Ticket>> =>
  apiClient.get(`/tickets/${ticketId}`).then((res) => res.data);

export const addTicketMessage = (
  ticketId: string,
  message: string
): Promise<ApiResponse<Ticket>> =>
  apiClient
    .post(`/tickets/${ticketId}/messages`, { message })
    .then((res) => res.data);

export const closeTicket = (ticketId: string): Promise<ApiResponse<any>> =>
  apiClient.patch(`/tickets/${ticketId}/close`).then((res) => res.data);
