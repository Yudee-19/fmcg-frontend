'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import {
  addTicketMessage,
  createTicket,
  getTicket,
  getTickets,
} from '@/services/ticketService';
import type { CreateTicketPayload } from '@/services/ticketService';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import { Link } from '@/i18n/navigation';
import type { PaginationMeta, Ticket } from '@/types';

const CATEGORIES = [
  'order',
  'payment',
  'delivery',
  'refund',
  'technical',
  'general',
] as const;

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

function isTicketCategory(value: string): value is (typeof CATEGORIES)[number] {
  return CATEGORIES.includes(value as (typeof CATEGORIES)[number]);
}

function isTicketPriority(value: string): value is (typeof PRIORITIES)[number] {
  return PRIORITIES.includes(value as (typeof PRIORITIES)[number]);
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_customer: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function SupportContent() {
  const t = useTranslations('support');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [mounted, setMounted] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<CreateTicketPayload['category'] | ''>('');
  const [priority, setPriority] = useState<CreateTicketPayload['priority']>('medium');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    fetchTickets(currentPage);
  }, [mounted, isAuthenticated, currentPage]);

  const fetchTickets = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getTickets({ page, limit: 6 });
      setTickets(response.data || []);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || t('error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId: string) => {
    try {
      setLoadingTicket(true);
      setError('');
      const response = await getTicket(ticketId);
      setSelectedTicket(response.data);
    } catch (err: any) {
      setError(err.message || t('error_loading_ticket'));
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !category || !message.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload: CreateTicketPayload = {
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      };
      if (orderId.trim()) payload.orderId = orderId.trim();

      const response = await createTicket(payload);
      setSuccess(t('ticket_created'));
      setSubject('');
      setCategory('');
      setPriority('medium');
      setMessage('');
      setOrderId('');
      setCurrentPage(1);
      setSelectedTicket(response.data);
      await fetchTickets(1);
    } catch (err: any) {
      setError(err.message || t('error_creating'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setReplying(true);
    setError('');
    setSuccess('');

    try {
      const response = await addTicketMessage(
        selectedTicket.ticketId,
        replyMessage.trim()
      );

      setSelectedTicket(response.data);
      setReplyMessage('');
      setSuccess(t('reply_added'));
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketId === response.data.ticketId ? response.data : ticket
        )
      );
    } catch (err: any) {
      setError(err.message || t('error_replying'));
    } finally {
      setReplying(false);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <p className="text-text-secondary text-lg mb-6">
          {t('login_required')}
        </p>
        <Link href="/auth/login">
          <Button size="lg">{tAuth('login')}</Button>
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="space-y-8">
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-8">
          <div className="bg-bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {t('new_ticket')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  {t('subject')}
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('subject_placeholder')}
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    {t('category')}
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => {
                      const nextCategory = e.target.value;
                      setCategory(
                        nextCategory === '' || isTicketCategory(nextCategory)
                          ? nextCategory
                          : ''
                      );
                    }}
                    className={inputClass}
                    required
                  >
                    <option value="">{t('select_category')}</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`category_${cat}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    {t('priority')}
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => {
                      const nextPriority = e.target.value;
                      if (isTicketPriority(nextPriority)) {
                        setPriority(nextPriority);
                      }
                    }}
                    className={inputClass}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {t(`priority_${p}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(category === 'order' ||
                category === 'delivery' ||
                category === 'refund' ||
                category === 'payment') && (
                <div>
                  <label
                    htmlFor="orderId"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    {t('order_id')}
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder={t('order_id_placeholder')}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  {t('message')}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('message_placeholder')}
                  className={inputClass}
                  required
                />
              </div>

              <Button
                type="submit"
                loading={submitting}
                disabled={
                  submitting || !subject.trim() || !category || !message.trim()
                }
              >
                {submitting ? t('submitting') : t('submit')}
              </Button>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {t('your_tickets')}
                </h2>
                {pagination && pagination.totalRecords > 0 && (
                  <p className="text-sm text-text-muted mt-1">
                    {t('showing_results', {
                      current: pagination.currentPage,
                      total: pagination.totalPages,
                      count: pagination.totalRecords,
                    })}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fetchTickets(currentPage)}
              >
                {t('refresh')}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-2 text-sm text-text-muted">
                  {t('loading_tickets')}
                </p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-bg-card rounded-xl border border-border p-6 text-center">
                <p className="text-text-muted">{t('no_tickets')}</p>
                <p className="text-text-muted text-sm mt-1">
                  {t('no_tickets_desc')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const isActive = selectedTicket?.ticketId === ticket.ticketId;

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => handleSelectTicket(ticket.ticketId)}
                      className={`w-full text-left bg-bg-card rounded-xl border p-5 transition-all hover:shadow-md ${
                        isActive
                          ? 'border-primary shadow-sm ring-1 ring-primary/20'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-text-primary truncate">
                            {ticket.subject}
                          </h3>
                          <p className="text-xs text-text-muted mt-0.5">
                            {t('ticket_id')}: {ticket.ticketId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              priorityColors[ticket.priority] ||
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {t(`priority_${ticket.priority}`)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              statusColors[ticket.status] ||
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {t(ticket.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted mt-2">
                        <span>
                          {t('category')}: {t(`category_${ticket.category}`)}
                        </span>
                        <span>
                          {t('messages_count', {
                            count: ticket.messageCount ?? ticket.messages.length,
                          })}
                        </span>
                        <span>{formatDate(ticket.updatedAt || ticket.createdAt)}</span>
                      </div>
                    </button>
                  );
                })}

                {pagination && (
                  <Pagination
                    meta={pagination}
                    onPageChange={setCurrentPage}
                    className="pt-3"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 h-fit xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('ticket_details')}
            </h2>
            {selectedTicket && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSelectTicket(selectedTicket.ticketId)}
              >
                {t('refresh')}
              </Button>
            )}
          </div>

          {loadingTicket ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !selectedTicket ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-text-primary font-medium">{t('select_ticket')}</p>
              <p className="text-sm text-text-muted mt-1">
                {t('select_ticket_desc')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-text-muted">
                      {t('ticket_id')}
                    </p>
                    <p className="text-base font-semibold text-text-primary mt-1">
                      {selectedTicket.ticketId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        priorityColors[selectedTicket.priority] ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {t(`priority_${selectedTicket.priority}`)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        statusColors[selectedTicket.status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {t(selectedTicket.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xl font-semibold text-text-primary">
                    {selectedTicket.subject}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted mt-2">
                    <span>
                      {t('category')}: {t(`category_${selectedTicket.category}`)}
                    </span>
                    <span>
                      {t('date')}: {formatDate(selectedTicket.createdAt)}
                    </span>
                    {selectedTicket.orderId && (
                      <span>
                        {t('order_id')}: {selectedTicket.orderId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">
                  {t('conversation')}
                </h3>
                <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                  {selectedTicket.messages.map((messageItem, index) => {
                    const isUser = messageItem.senderRole === 'USER';

                    return (
                      <div
                        key={`${messageItem.createdAt}-${index}`}
                        className={`rounded-xl border p-4 ${
                          isUser
                            ? 'bg-primary-light border-primary/20'
                            : 'bg-gray-50 border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                            {isUser ? t('you') : t('support_team')}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDate(messageItem.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-text-primary whitespace-pre-wrap leading-6">
                          {messageItem.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                <form onSubmit={handleReply} className="space-y-3 border-t border-border pt-4">
                  <div>
                    <label
                      htmlFor="replyMessage"
                      className="block text-sm font-medium text-text-secondary mb-1"
                    >
                      {t('reply')}
                    </label>
                    <textarea
                      id="replyMessage"
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={t('reply_placeholder')}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={replying}
                      disabled={replying || !replyMessage.trim()}
                    >
                      {replying ? t('sending_reply') : t('send_reply')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-lg bg-gray-50 border border-border p-4 text-sm text-text-secondary">
                  {t('ticket_closed_reply')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
