'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrder, getAddresses } from '@/lib/apiClient';
import { usePreferenceStore } from '@/store/preferenceStore';
import Button from '@/components/ui/Button';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';

export default function CheckoutForm() {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const totalItems = useCartStore((s) => s.totalItems);
  const clearCart = useCartStore((s) => s.clearCart);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const formatPrice = usePreferenceStore((s) => s.formatPrice);

  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('COD');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill address from user's default address via Address API
  useEffect(() => {
    if (!isAuthenticated) return;
    getAddresses()
      .then((res) => {
        const addrs = res.data ?? [];
        if (addrs.length > 0) {
          const defaultAddr =
            addrs.find((a: any) => a.isDefault) ?? addrs[0];
          setAddress({
            street: defaultAddr.street || '',
            city: defaultAddr.city || '',
            state: defaultAddr.state || '',
            postalCode: defaultAddr.postalCode || '',
            country: defaultAddr.country || 'India',
          });
        }
      })
      .catch(() => {
        // Address fetch failed — user enters manually
      });
  }, [isAuthenticated]);

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
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
            <Button size="lg">{t('login_cta')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
          </div>
          <p className="text-text-secondary text-lg mb-6">
            {t('empty_cart')}
          </p>
          <Link href="/shop">
            <Button size="lg">{t('go_to_shop')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddressChange = (
    field: keyof typeof address,
    value: string
  ) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    address.street.trim() !== '' &&
    address.city.trim() !== '' &&
    address.state.trim() !== '' &&
    address.postalCode.trim() !== '' &&
    address.country.trim() !== '';

  const handlePlaceOrder = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      const siteUrl =
        typeof window !== 'undefined' ? window.location.origin : '';

      const response = await createOrder({
        paymentMethod,
        shippingAddress: address,
        successUrl: `${siteUrl}/order-success`,
        cancelUrl: `${siteUrl}/checkout`,
      });

      clearCart();

      if (
        paymentMethod === 'ONLINE' &&
        response.checkoutSession?.url
      ) {
        // Redirect to Stripe checkout
        window.location.href = response.checkoutSession.url;
      } else {
        // COD or fallback: redirect to order success
        const orderNumber =
          response.data?.orderNumber ?? response.data?.id ?? '';
        router.push(`/order-success?orderNumber=${orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>

      {/* Shipping Information */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('shipping_info')}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="street"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              {t('street')}
            </label>
            <input
              id="street"
              type="text"
              value={address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t('street')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t('city')}
              </label>
              <input
                id="city"
                type="text"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t('city')}
              />
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t('state')}
              </label>
              <input
                id="state"
                type="text"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t('state')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t('postal_code')}
              </label>
              <input
                id="postalCode"
                type="text"
                value={address.postalCode}
                onChange={(e) =>
                  handleAddressChange('postalCode', e.target.value)
                }
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t('postal_code')}
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t('country')}
              </label>
              <input
                id="country"
                type="text"
                value={address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t('country')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('payment')}
        </h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-primary-light">
            <input
              type="radio"
              name="paymentMethod"
              value="ONLINE"
              checked={paymentMethod === 'ONLINE'}
              onChange={() => setPaymentMethod('ONLINE')}
              className="h-4 w-4 text-primary accent-primary"
            />
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="text-sm font-medium text-text-primary">
                {t('online')}
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-primary-light">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')}
              className="h-4 w-4 text-primary accent-primary"
            />
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-sm font-medium text-text-primary">
                {t('cod')}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('order_items')}
        </h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 py-2 border-b border-border last:border-b-0"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {item.title}
                </p>
                <p className="text-xs text-text-muted">
                  {tCart('quantity')}: {item.quantity}
                </p>
              </div>
              <PriceDisplay price={item.price * item.quantity} size="sm" />
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>
              {tCart('items')} ({totalItems})
            </span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>{tCart('shipping')}</span>
            <span className="text-success font-medium">{tCommon('free')}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-text-primary pt-2 border-t border-border">
            <span>{tCart('total')}</span>
            <span className="text-primary">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Place Order Button */}
      <Button
        size="lg"
        fullWidth
        loading={loading}
        disabled={!isFormValid || loading}
        onClick={handlePlaceOrder}
      >
        {loading ? t('processing') : t('place_order')}
      </Button>
    </div>
  );
}
