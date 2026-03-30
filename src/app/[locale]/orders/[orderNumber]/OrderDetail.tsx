'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { getOrderByNumber, cancelOrder } from '@/lib/apiClient';
import { usePreferenceStore } from '@/store/preferenceStore';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { Order } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function OrderDetail({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const formatPrice = usePreferenceStore((s) => s.formatPrice);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderByNumber(orderNumber);
        setOrder(response.data);
      } catch (err: any) {
        setError(err.message || t('error_loading_detail'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [mounted, isAuthenticated, orderNumber, t]);

  const handleCancel = async () => {
    if (!order || !window.confirm(t('cancel_confirm'))) return;

    setCancelling(true);
    try {
      await cancelOrder(order.id);
      setOrder((prev) =>
        prev ? { ...prev, orderStatus: 'cancelled' } : null
      );
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-text-secondary text-lg mb-6">
          {t('error_loading_detail')}
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
        <p className="mt-3 text-text-secondary">{t('loading_detail')}</p>
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

  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Order Overview */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-sm text-text-muted">{t('number')}</p>
            <p className="text-lg font-bold text-text-primary">
              {order.orderNumber}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {t(order.orderStatus)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
            <p className="text-text-muted">{t('payment_status')}</p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                paymentStatusColors[order.paymentStatus] ||
                'bg-gray-100 text-gray-800'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {order.orderStatus === 'pending' && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              loading={cancelling}
              onClick={handleCancel}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {cancelling ? t('cancelling') : t('cancel')}
            </Button>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('items')}
        </h2>

        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="text-sm font-medium text-text-primary hover:text-primary transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-text-muted mt-1">
                  {t('quantity')}: {item.quantity}
                </p>
              </div>
              <PriceDisplay price={item.price * item.quantity} size="sm" />
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
          <span className="text-sm font-semibold text-text-primary">
            {t('total')}
          </span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          {t('shipping_address')}
        </h2>
        <div className="text-sm text-text-secondary space-y-1">
          <p>{order.shippingAddress.street}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      </div>

      {/* Back to orders */}
      <div className="flex justify-center">
        <Link href="/orders">
          <Button variant="ghost">
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {tCommon('back')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
