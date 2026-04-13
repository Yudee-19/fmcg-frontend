'use client';

import apiClient from '../apiClient';
import type { AdminTicketDto, ApiResponse, Ticket, TicketStatsDto } from '@/types';

export const getAllTickets = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}): Promise<ApiResponse<AdminTicketDto[]>> =>
  apiClient
    .get('/tickets/admin/all', { params })
    .then((res) => res.data);

export const getTicketStats = (): Promise<ApiResponse<TicketStatsDto>> =>
  apiClient.get('/tickets/admin/stats').then((res) => res.data);

export const getAdminTicket = (
  ticketId: string
): Promise<ApiResponse<Ticket>> =>
  apiClient.get(`/tickets/admin/${ticketId}`).then((res) => res.data);

export const updateTicketStatus = (
  ticketId: string,
  status: Ticket['status']
): Promise<ApiResponse<Ticket>> =>
  apiClient
    .patch(`/tickets/admin/${ticketId}/status`, { status })
    .then((res) => res.data);

export const updateTicketPriority = (
  ticketId: string,
  priority: Ticket['priority']
): Promise<ApiResponse<Ticket>> =>
  apiClient
    .patch(`/tickets/admin/${ticketId}/priority`, { priority })
    .then((res) => res.data);

export const escalateTicket = (
  ticketId: string
): Promise<ApiResponse<any>> =>
  apiClient
    .patch(`/tickets/admin/${ticketId}/escalate`)
    .then((res) => res.data);

export const adminReplyToTicket = (
  ticketId: string,
  message: string
): Promise<ApiResponse<Ticket>> =>
  apiClient
    .post(`/tickets/admin/${ticketId}/messages`, { message })
    .then((res) => res.data);
