'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { getOrders } from '@/services/orderService';
import { usePreferenceStore } from '@/store/preferenceStore';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import type { Order } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function normalizeOrderStatus(status: string) {
  return status.toLowerCase();
}

export default function OrdersList() {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');

  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const formatPrice = usePreferenceStore((s) => s.formatPrice);
  const _currency = usePreferenceStore((s) => s.currency);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        setOrders(response.data || []);
      } catch (err: any) {
        setError(err.message || t('error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mounted, isAuthenticated, t]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
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
          {t('error_loading')}
        </p>
        <Link href="/auth/login">
          <Button size="lg">{tCommon('back')}</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 text-text-secondary">{t('loading_orders')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <p className="text-text-secondary text-lg mb-2">{t('no_orders')}</p>
        <Link href="/shop">
          <Button size="lg" className="mt-4">
            {t('no_orders_cta')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        (() => {
          const orderStatus = normalizeOrderStatus(order.orderStatus);

          return (
        <div
          key={order.id}
          className="bg-bg-card rounded-xl border border-border p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div>
              <p className="text-sm text-text-muted">
                {t('number')}
              </p>
              <p className="font-semibold text-text-primary">
                {order.orderNumber}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                statusColors[orderStatus] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {t(orderStatus)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="text-text-muted">{t('date')}</p>
              <p className="text-text-primary font-medium">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-text-muted">{t('total')}</p>
              <p className="text-primary font-bold">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-text-muted">{t('payment_method')}</p>
              <p className="text-text-primary font-medium">
                {order.paymentMethod === 'ONLINE' ? t('online') : t('cod')}
              </p>
            </div>
            <div>
              <p className="text-text-muted">{t('items')}</p>
              <p className="text-text-primary font-medium">
                {order.itemCount || order.totalItems}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href={`/orders/${order.orderNumber}`}>
              <Button variant="outline" size="sm">
                {t('view_details')}
              </Button>
            </Link>
          </div>
        </div>
          );
        })()
      ))}
    </div>
  );
}
