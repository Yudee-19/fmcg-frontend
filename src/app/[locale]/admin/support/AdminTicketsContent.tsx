'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCheck,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  ShieldAlert,
  Ticket,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils';
import {
  adminReplyToTicket,
  escalateTicket,
  getAdminTicket,
  getAllTickets,
  getTicketStats,
  updateTicketPriority,
  updateTicketStatus,
} from '@/services/admin/ticketService';
import { useAuthStore } from '@/store/authStore';
import type { AdminTicketDto, PaginationMeta, Ticket as TicketDetail, TicketStatsDto } from '@/types';

const STATUS_FILTERS = [
  'all',
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
] as const;

const PRIORITIES: TicketDetail['priority'][] = ['low', 'medium', 'high', 'urgent'];

const statusStyles: Record<TicketDetail['status'], string> = {
  open: 'border-sky-200 bg-sky-50 text-sky-700',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
  waiting_customer: 'border-orange-200 bg-orange-50 text-orange-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  closed: 'border-zinc-200 bg-zinc-100 text-zinc-700',
};

const priorityStyles: Record<TicketDetail['priority'], string> = {
  low: 'border-zinc-200 bg-zinc-100 text-zinc-700',
  medium: 'border-sky-200 bg-sky-50 text-sky-700',
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  urgent: 'border-rose-200 bg-rose-50 text-rose-700',
};

const recordsPerPageDefault = 10;

function formatTicketDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function TicketListShimmer() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-3xl border border-border bg-bg-card p-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="mt-3 h-6 w-3/4 rounded-full" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-12 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

function TicketDetailShimmer() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24 rounded-full" />
      <Skeleton className="h-8 w-2/3 rounded-full" />
      <Skeleton className="h-24 rounded-3xl" />
      <Skeleton className="h-24 rounded-3xl" />
      <Skeleton className="h-44 rounded-3xl" />
    </div>
  );
}

export default function AdminTicketsContent() {
  const t = useTranslations('admin_tickets');
  const tCommon = useTranslations('common');

  const [mounted, setMounted] = useState(false);
  const [tickets, setTickets] = useState<AdminTicketDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<TicketStatsDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      setIsListLoading(false);
      return;
    }

    void loadTickets(1, statusFilter, true);
    void loadStats();
  }, [mounted, isAuthenticated, user?.role]);

  const summaryCards = useMemo(() => {
    if (stats) {
      return [
        { key: 'summary_total', value: stats.totalTickets },
        { key: 'summary_open', value: stats.openTickets },
        { key: 'summary_in_progress', value: stats.inProgressTickets },
        { key: 'summary_resolved', value: stats.resolvedTickets },
        { key: 'summary_closed', value: stats.closedTickets },
        { key: 'summary_escalated', value: stats.escalatedTickets },
      ];
    }

    const derived = tickets.reduce(
      (accumulator, ticket) => {
        accumulator.total += 1;
        if (ticket.status === 'open') accumulator.open += 1;
        if (ticket.status === 'in_progress') accumulator.inProgress += 1;
        if (ticket.status === 'resolved') accumulator.resolved += 1;
        if (ticket.status === 'closed') accumulator.closed += 1;
        if (ticket.isEscalated) accumulator.escalated += 1;
        return accumulator;
      },
      { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, escalated: 0 }
    );

    return [
      { key: 'summary_total', value: derived.total },
      { key: 'summary_open', value: derived.open },
      { key: 'summary_in_progress', value: derived.inProgress },
      { key: 'summary_resolved', value: derived.resolved },
      { key: 'summary_closed', value: derived.closed },
      { key: 'summary_escalated', value: derived.escalated },
    ];
  }, [stats, tickets]);

  async function loadStats() {
    try {
      const response = await getTicketStats();
      setStats(response.data ?? null);
    } catch {
      setStats(null);
    }
  }

  async function loadTickets(
    page: number,
    status: (typeof STATUS_FILTERS)[number],
    showLoader: boolean
  ) {
    if (showLoader) {
      setIsListLoading(true);
    }

    try {
      const response = await getAllTickets({
        page,
        limit: recordsPerPageDefault,
        status: status === 'all' ? undefined : status,
      });

      const nextTickets = response.data ?? [];
      setTickets(nextTickets);
      setPagination(response.pagination ?? null);
      setCurrentPage(page);
      setStatusFilter(status);
      setError('');

      const nextSelectedTicketId =
        selectedTicketId && nextTickets.some((ticket) => ticket.ticketId === selectedTicketId)
          ? selectedTicketId
          : nextTickets[0]?.ticketId ?? '';

      setSelectedTicketId(nextSelectedTicketId);

      if (nextSelectedTicketId) {
        await loadTicketDetail(nextSelectedTicketId);
      } else {
        setSelectedTicket(null);
      }
    } catch (err: any) {
      const message = err?.message || t('load_failed');
      setTickets([]);
      setPagination(null);
      setSelectedTicket(null);
      setSelectedTicketId('');
      setError(message);
      toast.error(message);
    } finally {
      if (showLoader) {
        setIsListLoading(false);
      }
      setIsRefreshing(false);
    }
  }

  async function loadTicketDetail(ticketId: string) {
    setIsDetailLoading(true);

    try {
      const response = await getAdminTicket(ticketId);
      setSelectedTicket(response.data ?? null);
      setSelectedTicketId(ticketId);
    } catch (err: any) {
      setSelectedTicket(null);
      toast.error(err?.message || t('load_detail_failed'));
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function refreshCurrentState() {
    await Promise.all([
      loadTickets(currentPage, statusFilter, false),
      loadStats(),
    ]);
  }

  async function handleStatusChange(nextStatus: TicketDetail['status']) {
    if (!selectedTicket) {
      return;
    }

    setActionLoading('status');

    try {
      await updateTicketStatus(selectedTicket.ticketId, nextStatus);
      toast.success(t('status_success', { status: t(`status_${nextStatus}`) }));
      await refreshCurrentState();
    } catch (err: any) {
      toast.error(err?.message || t('status_failed'));
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePriorityChange(nextPriority: TicketDetail['priority']) {
    if (!selectedTicket) {
      return;
    }

    setActionLoading('priority');

    try {
      await updateTicketPriority(selectedTicket.ticketId, nextPriority);
      toast.success(t('priority_success', { priority: t(`priority_${nextPriority}`) }));
      await refreshCurrentState();
    } catch (err: any) {
      toast.error(err?.message || t('priority_failed'));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEscalate() {
    if (!selectedTicket) {
      return;
    }

    setActionLoading('escalate');

    try {
      await escalateTicket(selectedTicket.ticketId);
      toast.success(t('escalate_success'));
      await refreshCurrentState();
    } catch (err: any) {
      toast.error(err?.message || t('escalate_failed'));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReplySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTicket || !replyMessage.trim()) {
      toast.error(t('reply_required'));
      return;
    }

    setActionLoading('reply');

    try {
      await adminReplyToTicket(selectedTicket.ticketId, replyMessage.trim());
      setReplyMessage('');
      toast.success(t('reply_success'));
      await refreshCurrentState();
    } catch (err: any) {
      toast.error(err?.message || t('reply_failed'));
    } finally {
      setActionLoading(null);
    }
  }

  function handleRefresh() {
    setIsRefreshing(true);
    void refreshCurrentState();
  }

  function handlePageChange(page: number) {
    if (page === currentPage || isListLoading || Boolean(actionLoading)) {
      return;
    }

    void loadTickets(page, statusFilter, true);
  }

  if (!mounted) {
    return <Skeleton className="h-96 rounded-3xl" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-4 text-sm text-text-secondary">{t('admin_login_required')}</p>
        <div className="mt-5">
          <Link href="/auth/login">
            <Button>{tCommon('login')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-4 text-sm text-text-secondary">{t('admin_only')}</p>
        <div className="mt-5">
          <Link href="/">
            <Button variant="outline">{t('back_home')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-light px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Ticket className="h-3.5 w-3.5" />
              {t('records_total', { count: pagination?.totalRecords ?? tickets.length })}
            </div>
            {pagination ? (
              <p className="text-sm text-text-secondary">
                {t('showing_records', {
                  start: (pagination.currentPage - 1) * pagination.recordsPerPage + 1,
                  end:
                    (pagination.currentPage - 1) * pagination.recordsPerPage +
                    tickets.length,
                  total: pagination.totalRecords,
                  perPage: pagination.recordsPerPage,
                })}
              </p>
            ) : null}
          </div>

          <Button type="button" variant="outline" size="lg" className="rounded-xl px-5" onClick={handleRefresh}>
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : 'hidden'}`} />
              <CheckCheck className={`h-4 w-4 ${isRefreshing ? 'hidden' : ''}`} />
              {t('refresh')}
            </span>
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {summaryCards.map((card) => (
            <div key={card.key} className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                {t(card.key as any)}
              </p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => void loadTickets(1, status, true)}
              disabled={isListLoading || Boolean(actionLoading)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                statusFilter === status
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-text-secondary hover:bg-primary-light'
              } disabled:pointer-events-none disabled:opacity-50`}
            >
              {t(`status_${status}`)}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-[28px] border border-border bg-white p-4 shadow-sm">
          {isListLoading ? <TicketListShimmer /> : null}

          {!isListLoading && tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-bg-card px-5 py-10 text-center text-sm text-text-secondary">
              {t('empty_list')}
            </div>
          ) : null}

          {!isListLoading && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => void loadTicketDetail(ticket.ticketId)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    selectedTicketId === ticket.ticketId
                      ? 'border-primary bg-primary-light/40 shadow-sm'
                      : 'border-border bg-white hover:bg-bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                        {ticket.ticketId}
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-text-primary">{ticket.subject}</h2>
                      <p className="mt-2 text-sm text-text-secondary">
                        {t(`category_${ticket.category}`)}
                      </p>
                    </div>
                    <Clock3 className="h-4 w-4 text-primary" />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${statusStyles[ticket.status]}`}>
                      {t(`status_${ticket.status}`)}
                    </span>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${priorityStyles[ticket.priority]}`}>
                      {t(`priority_${ticket.priority}`)}
                    </span>
                    {ticket.isEscalated ? (
                      <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700">
                        {t('escalated_badge')}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-sm text-text-secondary">
                    {t('ticket_created_on', { date: formatTicketDate(ticket.createdAt) })}
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          {pagination ? (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm text-text-secondary">
                {t('page_summary', {
                  current: pagination.currentPage,
                  total: pagination.totalPages,
                })}
              </p>
              <Pagination meta={pagination} onPageChange={handlePageChange} className="mt-4 justify-start" />
            </div>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
          {isDetailLoading ? <TicketDetailShimmer /> : null}

          {!isDetailLoading && !selectedTicket ? (
            <div className="rounded-2xl border border-dashed border-border bg-bg-card px-6 py-12 text-center text-sm text-text-secondary">
              {t('select_ticket')}
            </div>
          ) : null}

          {!isDetailLoading && selectedTicket ? (
            <>
              <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                    {selectedTicket.ticketId}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-text-primary">
                    {selectedTicket.subject}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                    <span>{t(`category_${selectedTicket.category}`)}</span>
                    <span>{t('updated_on', { date: formatTicketDate(selectedTicket.updatedAt) })}</span>
                    <span>{t('user_id')}: {selectedTicket.userId}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${statusStyles[selectedTicket.status]}`}>
                    {t(`status_${selectedTicket.status}`)}
                  </span>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${priorityStyles[selectedTicket.priority]}`}>
                    {t(`priority_${selectedTicket.priority}`)}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-4">
                  {selectedTicket.messages.map((message, index) => (
                    <article key={`${message.createdAt}-${index}`} className="rounded-3xl border border-border bg-bg-card p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                            {message.senderRole}
                          </p>
                          <p className="mt-1 text-sm text-text-secondary">{message.sender}</p>
                        </div>
                        <p className="text-sm text-text-muted">{formatTicketDate(message.createdAt)}</p>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text-primary">
                        {message.message}
                      </p>
                    </article>
                  ))}
                </div>

                <aside className="space-y-4 rounded-3xl border border-border bg-bg-card p-4">
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                      {t('status_label')}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'] as TicketDetail['status'][]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={actionLoading === 'status' || selectedTicket.status === status}
                          onClick={() => void handleStatusChange(status)}
                          className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary transition hover:bg-primary-light disabled:pointer-events-none disabled:opacity-50"
                        >
                          {t(`status_${status}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-4">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                      {t('priority_label')}
                      <select
                        value={selectedTicket.priority}
                        disabled={actionLoading === 'priority'}
                        onChange={(event) =>
                          void handlePriorityChange(event.target.value as TicketDetail['priority'])
                        }
                        className="mt-3 h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      >
                        {PRIORITIES.map((priority) => (
                          <option key={priority} value={priority}>
                            {t(`priority_${priority}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-4">
                    <button
                      type="button"
                      disabled={actionLoading === 'escalate' || selectedTicket.isEscalated}
                      onClick={() => void handleEscalate()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      {selectedTicket.isEscalated ? t('escalated_badge') : t('escalate_action')}
                    </button>
                  </div>

                  <form className="rounded-2xl border border-border bg-white p-4" onSubmit={(event) => void handleReplySubmit(event)}>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{t('reply_label')}</p>
                    <textarea
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      rows={6}
                      className="mt-3 w-full rounded-2xl border border-border px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      placeholder={t('reply_placeholder')}
                    />
                    <button
                      type="submit"
                      disabled={actionLoading === 'reply'}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
                    >
                      <MessageSquareText className="h-4 w-4" />
                      {actionLoading === 'reply' ? t('reply_sending') : t('reply_send')}
                    </button>
                  </form>
                </aside>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}