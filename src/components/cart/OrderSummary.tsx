'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import { useRouter } from '@/i18n/navigation';
import { getCart } from '@/services/cartService';
import { applyCoupon, removeCoupon } from '@/services/couponService';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { EarnHint } from '@/components/loyalty/EarnHint';

interface CartSummary {
  subtotal: number;
  appliedLoyaltyDiscount: number;
  appliedCouponDiscount: number;
  finalAmount: number;
}

interface LoyaltyInfo {
  currentBalance: number;
  maxPointsCanApply: number;
  appliedPoints: number;
  remainingPoints: number;
}

interface CouponInfo {
  code: string;
  discountPercentage: number;
  discountAmount: number;
}

export default function OrderSummary() {
  const [mounted, setMounted] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);

  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setCurrentPoints = useLoyaltyStore((s) => s.setCurrentPoints);
  const fetchMyPoints = useLoyaltyStore((s) => s.fetchMyPoints);

  const router = useRouter();
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const tOs = useTranslations('order_summary');

  // Refetch cart from server to get fresh cartSummary + loyaltyInfo
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartSummary(null);
      setLoyaltyInfo(null);
      setCouponInfo(null);
      return;
    }
    try {
      const res = await getCart();
      const summary = (res as any).cartSummary as CartSummary | undefined;
      const loyalty = (res as any).loyaltyInfo as LoyaltyInfo | undefined;
      const coup = (res as any).couponInfo as CouponInfo | null | undefined;
      if (summary) setCartSummary(summary);
      if (loyalty) {
        setLoyaltyInfo(loyalty);
        setCurrentPoints(loyalty.currentBalance);
      }
      setCouponInfo(coup ?? null);
    } catch {
      // ignore — fall back to local cart store values
    }
  }, [isAuthenticated, setCurrentPoints]);

  const handleApplyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponError('');
    setCouponBusy(true);
    try {
      await applyCoupon(code);
      setCoupon('');
      await refreshCart();
      toast.success(`Coupon ${code} applied`);
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Invalid coupon';
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setCouponBusy(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponBusy(true);
    try {
      await removeCoupon();
      await refreshCart();
      toast.success('Coupon removed');
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Failed to remove');
    } finally {
      setCouponBusy(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      refreshCart();
      if (isAuthenticated) fetchMyPoints();
    }
  }, [mounted, items.length, refreshCart, isAuthenticated, fetchMyPoints]);

  if (!mounted) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  if (items.length === 0) return null;

  // Prefer server cartSummary when available, else fall back to local store
  const subtotal = cartSummary?.subtotal ?? totalAmount;
  const loyaltyDiscount = cartSummary?.appliedLoyaltyDiscount ?? 0;
  const couponDiscount = cartSummary?.appliedCouponDiscount ?? 0;
  const finalAmount = cartSummary?.finalAmount ?? totalAmount;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-6 lg:sticky lg:top-24 space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">
        {t('order_summary')}
      </h2>

      {/* Earn hint */}
      {isAuthenticated && <EarnHint cartAmount={subtotal} />}

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('items')} ({totalItems})
          </span>
          <PriceDisplay price={subtotal} size="sm" />
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">{t('shipping')}</span>
          <span className="text-success font-medium">{tc('free')}</span>
        </div>

        {loyaltyDiscount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary flex items-center gap-1">
              <span aria-hidden>👑</span> {tOs('loyalty_discount')}
            </span>
            <div className="flex items-center gap-1 text-success font-medium">
              <span>−</span>
              <PriceDisplay price={loyaltyDiscount} size="sm" />
            </div>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">{tOs('coupon_discount')}</span>
            <div className="flex items-center gap-1 text-success font-medium">
              <span>−</span>
              <PriceDisplay price={couponDiscount} size="sm" />
            </div>
          </div>
        )}

        <div className="border-t border-border pt-3 flex justify-between">
          <span className="font-semibold text-text-primary">{t('total')}</span>
          <PriceDisplay price={finalAmount} size="md" />
        </div>
      </div>

      {/* Coupon — applied state OR input */}
      {couponInfo ? (
        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-3">
          <span aria-hidden className="text-lg">🎟️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {couponInfo.code} applied
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {couponInfo.discountPercentage}% off — you saved{' '}
              {couponInfo.discountAmount.toFixed(3)} KWD
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            disabled={couponBusy}
            className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {couponBusy ? '…' : 'Remove'}
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => {
                setCoupon(e.target.value.toUpperCase());
                setCouponError('');
              }}
              placeholder={t('coupon_placeholder')}
              maxLength={7}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase tracking-wider"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyCoupon}
              loading={couponBusy}
              disabled={!coupon.trim() || couponBusy}
            >
              {t('apply')}
            </Button>
          </div>
          {couponError && (
            <p className="text-xs text-red-600">{couponError}</p>
          )}
        </div>
      )}

      {/* Checkout button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => router.push('/checkout')}
      >
        {t('checkout')}
      </Button>
    </div>
  );
}
