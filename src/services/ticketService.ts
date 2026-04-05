'use client';

import apiClient from './apiClient';
import type { ApiResponse, Ticket } from '@/types';

export const createTicket = (payload: any): Promise<ApiResponse<Ticket>> =>
  apiClient.post('/tickets', payload).then((res) => res.data);

export const getTickets = (): Promise<ApiResponse<Ticket[]>> =>
  apiClient.get('/tickets').then((res) => res.data);

export const getTicket = (ticketId: string): Promise<ApiResponse<Ticket>> =>
  apiClient.get(`/tickets/${ticketId}`).then((res) => res.data);

export const addTicketMessage = (
  ticketId: string,
  message: string
): Promise<ApiResponse<any>> =>
  apiClient
    .post(`/tickets/${ticketId}/messages`, { message })
    .then((res) => res.data);

export const closeTicket = (ticketId: string): Promise<ApiResponse<any>> =>
  apiClient.patch(`/tickets/${ticketId}/close`).then((res) => res.data);
