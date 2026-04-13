'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { LayoutGrid, List, PackageSearch, ShieldAlert, Truck, BadgeCheck, Clock3 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import { getLocalized, formatDate } from '@/lib/utils';
import { getAllOrders, shipOrder, updateOrderStatus, verifyOrderDelivery } from '@/services/admin/orderService';
import { useAuthStore } from '@/store/authStore';
import type { Order, PaginationMeta } from '@/types';

type ViewMode = 'grid' | 'table';
type PendingActionType = 'confirm' | 'cancel' | 'ship' | 'verify';

interface PendingAction {
  type: PendingActionType;
  order: Order;
}

const recordsPerPageDefault = 20;

const orderStatusStyles: Record<Order['orderStatus'], string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  CONFIRMED: 'border-sky-200 bg-sky-50 text-sky-700',
  SHIPPED: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  DELIVERED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
};

const paymentStatusStyles: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  PROCESSING: 'border-sky-200 bg-sky-50 text-sky-700',
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REFUNDED: 'border-zinc-200 bg-zinc-100 text-zinc-700',
  FAILED: 'border-rose-200 bg-rose-50 text-rose-700',
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminOrdersContent() {
  const t = useTranslations('admin_orders');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      setIsLoading(false);
      return;
    }

    void loadOrders(true, 1);
  }, [mounted, isAuthenticated, user?.role]);

  const orderSummary = useMemo(
    () =>
      orders.reduce(
        (accumulator, order) => {
          accumulator.total += 1;
          if (order.orderStatus === 'PENDING') accumulator.pending += 1;
          if (order.orderStatus === 'CONFIRMED') accumulator.confirmed += 1;
          if (order.orderStatus === 'SHIPPED') accumulator.shipped += 1;
          if (order.orderStatus === 'DELIVERED') accumulator.delivered += 1;
          if (order.orderStatus === 'CANCELLED') accumulator.cancelled += 1;
          return accumulator;
        },
        {
          total: 0,
          pending: 0,
          confirmed: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        }
      ),
    [orders]
  );

  const visibleRange = useMemo(() => {
    if (!pagination || orders.length === 0) {
      return null;
    }

    const start = (pagination.currentPage - 1) * pagination.recordsPerPage + 1;
    const end = start + orders.length - 1;

    return { start, end };
  }, [orders.length, pagination]);

  async function loadOrders(showLoader: boolean, page: number) {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const response = await getAllOrders({ page, limit: recordsPerPageDefault });
      setOrders(response.data ?? []);
      setPagination(response.pagination ?? null);
      setCurrentPage(page);
      setError('');
    } catch (err: any) {
      const message = err?.message || t('load_failed');
      setOrders([]);
      setPagination(null);
      setError(message);
      toast.error(message);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }

  function openActionModal(type: PendingActionType, order: Order) {
    setDeliveryOtp('');
    setPendingAction({ type, order });
  }

  function closeActionModal() {
    if (isSubmittingAction) {
      return;
    }

    setPendingAction(null);
    setDeliveryOtp('');
  }

  async function handleActionConfirm() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === 'verify' && !deliveryOtp.trim()) {
      toast.error(t('otp_required'));
      return;
    }

    setIsSubmittingAction(true);

    try {
      if (pendingAction.type === 'confirm') {
        await updateOrderStatus(pendingAction.order.id, { status: 'CONFIRMED' });
        toast.success(t('confirm_success', { orderNumber: pendingAction.order.orderNumber }));
      }

      if (pendingAction.type === 'cancel') {
        await updateOrderStatus(pendingAction.order.id, { status: 'CANCELLED' });
        toast.success(t('cancel_success', { orderNumber: pendingAction.order.orderNumber }));
      }

      if (pendingAction.type === 'ship') {
        await shipOrder(pendingAction.order.id);
        toast.success(t('ship_success', { orderNumber: pendingAction.order.orderNumber }));
      }

      if (pendingAction.type === 'verify') {
        await verifyOrderDelivery(pendingAction.order.id, deliveryOtp.trim());
        toast.success(t('verify_success', { orderNumber: pendingAction.order.orderNumber }));
      }

      setPendingAction(null);
      setDeliveryOtp('');
      await loadOrders(false, currentPage);
    } catch (err: any) {
      toast.error(err?.message || t('action_failed'));
    } finally {
      setIsSubmittingAction(false);
    }
  }

  function getActionLabel(type: PendingActionType) {
    if (type === 'confirm') return t('action_confirm');
    if (type === 'cancel') return t('action_cancel');
    if (type === 'ship') return t('action_ship');
    return t('action_verify');
  }

  function getActionDescription(type: PendingActionType) {
    if (type === 'confirm') return t('action_confirm_description');
    if (type === 'cancel') return t('action_cancel_description');
    if (type === 'ship') return t('action_ship_description');
    return t('action_verify_description');
  }

  function handlePageChange(page: number) {
    if (page === currentPage || isLoading || isSubmittingAction) {
      return;
    }

    void loadOrders(true, page);
  }

  function renderOrderActions(order: Order) {
    return (
      <div className="flex flex-wrap gap-2">
        {order.orderStatus === 'PENDING' ? (
          <>
            <button
              type="button"
              onClick={() => openActionModal('confirm', order)}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover"
            >
              {t('action_confirm')}
            </button>
            <button
              type="button"
              onClick={() => openActionModal('cancel', order)}
              className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              {t('action_cancel')}
            </button>
          </>
        ) : null}

        {order.orderStatus === 'CONFIRMED' ? (
          <button
            type="button"
            onClick={() => openActionModal('ship', order)}
            className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            <Truck className="h-3.5 w-3.5" />
            {t('action_ship')}
          </button>
        ) : null}

        {order.orderStatus === 'SHIPPED' ? (
          <button
            type="button"
            onClick={() => openActionModal('verify', order)}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {t('action_verify')}
          </button>
        ) : null}
      </div>
    );
  }

  if (!mounted) {
    return <Skeleton className="h-80 rounded-2xl" />;
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
    <>
      <div className="rounded-[32px] border border-primary/10 bg-white p-5 shadow-[0_18px_50px_rgba(196,30,58,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border border-primary/10 bg-primary-light px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {t('records_total', { count: pagination?.totalRecords ?? orders.length })}
            </div>
            {pagination && visibleRange ? (
              <p className="text-sm text-text-secondary">
                {t('showing_records', {
                  start: visibleRange.start,
                  end: visibleRange.end,
                  total: pagination.totalRecords,
                  perPage: pagination.recordsPerPage,
                })}
              </p>
            ) : null}
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary-light'
              }`}
              aria-label={t('grid_view')}
              title={t('grid_view')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary-light'
              }`}
              aria-label={t('table_view')}
              title={t('table_view')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {[
            ['summary_total', orderSummary.total],
            ['summary_pending', orderSummary.pending],
            ['summary_confirmed', orderSummary.confirmed],
            ['summary_shipped', orderSummary.shipped],
            ['summary_delivered', orderSummary.delivered],
            ['summary_cancelled', orderSummary.cancelled],
          ].map(([labelKey, value]) => (
            <div key={labelKey} className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                {t(labelKey as any)}
              </p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-48 rounded-3xl" />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-bg-card px-6 py-12 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-text-muted" />
            <h2 className="mt-4 text-lg font-semibold text-text-primary">{t('empty_title')}</h2>
            <p className="mt-2 text-sm text-text-secondary">{t('empty_description')}</p>
          </div>
        ) : null}

        {!isLoading && orders.length > 0 && viewMode === 'grid' ? (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-3xl border border-border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                      {order.orderNumber}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xl font-bold text-text-primary">
                      <span>{t('items_count', { count: order.totalItems })} ·</span>
                      <PriceDisplay price={order.totalAmount} size="md" className="gap-0" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-4 w-4" />
                        {t('placed_on', { date: formatOrderDate(order.createdAt) })}
                      </span>
                      <span>{t('updated_on', { date: formatOrderDate(order.updatedAt) })}</span>
                      <span>{t('payment_method')}: {order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${orderStatusStyles[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${paymentStatusStyles[order.paymentStatus] ?? 'border-zinc-200 bg-zinc-100 text-zinc-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {order.items.map((item, itemIndex) => {
                    const itemTitle = getLocalized(item.title, locale) || t('item_fallback');
                    const itemImage = typeof item.thumbnail === 'string' ? item.thumbnail.trim() : '';

                    return (
                      <div key={`${order.id}-${item.productId}-${itemIndex}`} className="rounded-2xl border border-border bg-bg-card p-3">
                        <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-xl bg-white">
                          {itemImage ? (
                            <Image
                              src={itemImage}
                              alt={itemTitle}
                              fill
                              className="object-contain p-2"
                              sizes="(max-width: 768px) 50vw, 220px"
                            />
                          ) : (
                            <span className="px-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                              {t('no_image')}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm font-semibold text-text-primary">{itemTitle}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-text-secondary">
                          <PriceDisplay price={item.price} size="sm" className="gap-0" />
                          <span>· Qty {item.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-3 border-t border-border pt-4 text-sm text-text-secondary lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                  <div>
                    <p className="font-medium text-text-primary">{t('shipping_address')}</p>
                    <p className="mt-1">
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{t('customer_total')}</p>
                    <PriceDisplay price={order.totalAmount} size="sm" className="mt-1 gap-0" />
                  </div>
                  <div className="lg:justify-self-end">{renderOrderActions(order)}</div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!isLoading && orders.length > 0 && viewMode === 'table' ? (
          <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-bg-card text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  <tr>
                    <th className="px-4 py-3">{t('columns_order')}</th>
                    <th className="px-4 py-3">{t('columns_date')}</th>
                    <th className="px-4 py-3">{t('columns_items')}</th>
                    <th className="px-4 py-3">{t('columns_total')}</th>
                    <th className="px-4 py-3">{t('columns_order_status')}</th>
                    <th className="px-4 py-3">{t('columns_payment')}</th>
                    <th className="px-4 py-3 text-right">{t('columns_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-bg-card/80">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text-primary">{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-text-secondary">{order.paymentMethod}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        <p>{formatDate(order.createdAt)}</p>
                        <p className="mt-1 text-xs text-text-muted">{t('updated_on_short', { date: formatDate(order.updatedAt) })}</p>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">{order.totalItems}</td>
                      <td className="px-4 py-4"><PriceDisplay price={order.totalAmount} size="sm" className="gap-0" /></td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${orderStatusStyles[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${paymentStatusStyles[order.paymentStatus] ?? 'border-zinc-200 bg-zinc-100 text-zinc-700'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">{renderOrderActions(order)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {!isLoading && pagination ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm text-text-secondary">
              <p>{t('page_summary', { current: pagination.currentPage, total: pagination.totalPages })}</p>
              <p>{t('per_page', { count: pagination.recordsPerPage || recordsPerPageDefault })}</p>
            </div>
            <Pagination meta={pagination} onPageChange={handlePageChange} />
          </div>
        ) : null}
      </div>

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-[0_28px_80px_rgba(19,18,22,0.28)]">
            <h3 className="text-xl font-semibold text-text-primary">{getActionLabel(pendingAction.type)}</h3>
            <p className="mt-3 text-sm leading-6 text-text-secondary">{getActionDescription(pendingAction.type)}</p>
            <p className="mt-3 rounded-xl bg-primary-light px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              {t('modal_order_label', { orderNumber: pendingAction.order.orderNumber })}
            </p>

            {pendingAction.type === 'verify' ? (
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-medium text-text-primary">{t('otp_label')}</span>
                <input
                  type="text"
                  value={deliveryOtp}
                  onChange={(event) => setDeliveryOtp(event.target.value)}
                  placeholder={t('otp_placeholder')}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={closeActionModal} disabled={isSubmittingAction}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={() => void handleActionConfirm()} loading={isSubmittingAction}>
                {isSubmittingAction ? t('submitting') : t('confirm_button')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}