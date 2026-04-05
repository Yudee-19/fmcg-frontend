'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { getTickets, createTicket } from '@/services/ticketService';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import type { Ticket } from '@/types';

const CATEGORIES = [
  'order',
  'payment',
  'delivery',
  'refund',
  'technical',
  'general',
] as const;

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

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

  const [mounted, setMounted] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    fetchTickets();
  }, [mounted, isAuthenticated]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getTickets();
      setTickets(response.data || []);
    } catch (err: any) {
      setError(err.message || t('error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !category || !message.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload: Record<string, any> = {
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      };
      if (orderId.trim()) payload.orderId = orderId.trim();

      await createTicket(payload);
      setSuccess(t('ticket_created'));
      setSubject('');
      setCategory('');
      setPriority('medium');
      setMessage('');
      setOrderId('');
      // Refresh tickets list
      await fetchTickets();
    } catch (err: any) {
      setError(err.message || t('error_creating'));
    } finally {
      setSubmitting(false);
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
          Please login to access support.
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
      {/* Create New Ticket Form */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('new_ticket')}
        </h2>

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
              placeholder={t('subject')}
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
                onChange={(e) => setCategory(e.target.value)}
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
                onChange={(e) => setPriority(e.target.value)}
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

          {/* Order ID — show when category is order/delivery/refund related */}
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
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('message')}
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

      {/* Existing Tickets */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('your_tickets')}
        </h2>

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
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-bg-card rounded-xl border border-border p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-text-primary">
                      {ticket.subject}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {t('ticket_id')}: {ticket.ticketId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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

                <div className="flex items-center justify-between text-xs text-text-muted mt-2">
                  <span>
                    {t('category')}: {t(`category_${ticket.category}`)}
                  </span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
