'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrder } from '@/services/orderService';
import { getAddresses } from '@/services/addressService';
import { clearCartApi } from '@/services/cartService';
import { usePreferenceStore } from '@/store/preferenceStore';
import { useCardSDK } from '@/hooks/useCardSDK';
import { useGooglePaySDK } from '@/hooks/useGooglePaySDK';
import { useApplePaySDK } from '@/hooks/useApplePaySDK';
import { PaymentModal } from '@/components/payment/PaymentModal';
import type { TapPaymentSource } from '@/components/payment/PaymentPanel';
import { LoyaltyRedeemWidget } from '@/components/loyalty/LoyaltyRedeemWidget';
import { getCart } from '@/services/cartService';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import { getLocalized } from '@/lib/utils';
import Button from '@/components/ui/Button';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';

export default function CheckoutForm() {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');
  const locale = useLocale();

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tapPaymentSource, setTapPaymentSource] = useState<TapPaymentSource>('CARD');
  const [tapError, setTapError] = useState('');
  const [tapToken, setTapToken] = useState<string | null>(null);
  const [tapPaying, setTapPaying] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kuwait',
  });

  const cardSDK = useCardSDK();
  const gpaySDK = useGooglePaySDK();
  const applePaySDK = useApplePaySDK();

  const setCurrentPoints = useLoyaltyStore((s) => s.setCurrentPoints);
  const [cartSummary, setCartSummary] = useState<{
    subtotal: number;
    appliedLoyaltyDiscount: number;
    appliedCouponDiscount: number;
    finalAmount: number;
  } | null>(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState<{
    currentBalance: number;
    maxPointsCanApply: number;
    appliedPoints: number;
    remainingPoints: number;
  } | null>(null);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getCart();
      const summary = (res as any).cartSummary;
      const loyalty = (res as any).loyaltyInfo;
      if (summary) setCartSummary(summary);
      if (loyalty) {
        setLoyaltyInfo(loyalty);
        setCurrentPoints(loyalty.currentBalance);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => { setMounted(true); }, []);

  // Pre-fill address from saved addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    getAddresses()
      .then((res) => {
        const addrs = res.data ?? [];
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a: any) => a.isDefault) ?? addrs[0];
          setAddress({
            street: defaultAddr.street || '',
            city: defaultAddr.city || '',
            state: defaultAddr.state || '',
            postalCode: defaultAddr.postalCode || '',
            country: defaultAddr.country || 'Kuwait',
          });
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Preload Card SDK as soon as the checkout page mounts (script + user ready
  // and CARD is the active Tap source). The iframe renders silently into
  // #tap-card-element which is always in the DOM (modal is opacity:0 + inert
  // until shown), so when the user later opens the payment modal the card
  // form appears INSTANTLY — no "Loading card form…" spinner.
  useEffect(() => {
    if (
      cardSDK.cardScriptLoaded &&
      user &&
      tapPaymentSource === 'CARD'
    ) {
      cardSDK.init(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          username: user.username,
        },
        setTapToken,
        (msg) => {
          setTapError(msg);
          setTapPaying(false);
        },
      );
      return () => cardSDK.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardSDK.cardScriptLoaded, user, tapPaymentSource]);

  // When Card SDK fires onSuccess → tapToken is set → send to backend
  useEffect(() => {
    if (!tapToken || !tapPaying) return;

    const submit = async () => {
      try {
        const res = await createOrder({
          paymentMethod: 'ONLINE',
          paymentSource:
            tapPaymentSource === 'GOOGLE_PAY'
              ? 'GOOGLE_PAY'
              : tapPaymentSource === 'APPLE_PAY'
                ? 'APPLE_PAY'
                : 'CARD',
          token: tapToken,
          shippingAddress: address,
          successUrl: `${window.location.origin}/${locale}/payment-callback`,
        });
        clearCartApi().catch(() => {});
        clearCart();
        const threeDSUrl = res.checkoutSession?.threeDSUrl;
        if (threeDSUrl) {
          window.location.href = threeDSUrl;
        } else {
          const orderNumber = res.data?.orderNumber ?? res.data?.id ?? '';
          router.push(`/order-success?orderNumber=${orderNumber}`);
        }
      } catch (err: any) {
        setTapError(err.message || 'Payment failed');
        setTapPaying(false);
      }
    };

    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tapToken]);

  // Init Google Pay when modal opens with GPAY selected
  useEffect(() => {
    if (
      gpaySDK.gpayScriptLoaded &&
      showPaymentModal &&
      tapPaymentSource === 'GOOGLE_PAY'
    ) {
      const chargeAmount = cartSummary?.finalAmount ?? totalAmount;
      gpaySDK.init(
        chargeAmount,
        (token) => {
          setTapPaying(true);
          setTapToken(token);
        },
        (msg) => {
          setTapError(msg);
          setTapPaying(false);
        },
      );
      return () => gpaySDK.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpaySDK.gpayScriptLoaded, showPaymentModal, tapPaymentSource, totalAmount, cartSummary?.finalAmount]);

  // Init Apple Pay when modal opens with APPLE_PAY selected
  useEffect(() => {
    if (
      applePaySDK.applePayScriptLoaded &&
      user &&
      showPaymentModal &&
      tapPaymentSource === 'APPLE_PAY'
    ) {
      applePaySDK.init(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          username: user.username,
        },
        cartSummary?.finalAmount ?? totalAmount,
        (token) => {
          // Apple Pay returns tok_xxx directly — set a flag so the submit
          // effect skips the /v2/tokens exchange on the backend.
          setTapPaying(true);
          setTapToken(token);
        },
        (msg) => {
          setTapError(msg);
          setTapPaying(false);
        },
        () => {
          setTapPaying(false);
        },
      );
      return () => applePaySDK.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applePaySDK.applePayScriptLoaded, user, showPaymentModal, tapPaymentSource, totalAmount, cartSummary?.finalAmount]);

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

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-text-secondary text-lg mb-6">{t('login_required')}</p>
          <Link href="/auth/login"><Button size="lg">{t('login_cta')}</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <p className="text-text-secondary text-lg mb-6">{t('empty_cart')}</p>
          <Link href="/shop"><Button size="lg">{t('go_to_shop')}</Button></Link>
        </div>
      </div>
    );
  }

  const handleAddressChange = (field: keyof typeof address, value: string) => {
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
    setError('');
    setTapError('');

    // COD — direct order
    if (paymentMethod === 'COD') {
      setLoading(true);
      try {
        const response = await createOrder({ paymentMethod: 'COD', shippingAddress: address });
        clearCartApi().catch(() => {});
        clearCart();
        const orderNumber = response.data?.orderNumber ?? response.data?.id ?? '';
        router.push(`/order-success?orderNumber=${orderNumber}`);
      } catch (err: any) {
        setError(err.message || 'Failed to place order');
        setLoading(false);
      }
      return;
    }

    // ONLINE — open the payment modal
    setShowPaymentModal(true);
  };

  const handlePay = async () => {
    setTapError('');

    // CARD
    if (tapPaymentSource === 'CARD') {
      setTapPaying(true);
      setTapToken(null);
      try {
        await cardSDK.tokenize();
        // onSuccess fires → tapToken state updates → useEffect above sends to backend
      } catch (err: any) {
        setTapError(err.message || 'Tokenization failed');
        setTapPaying(false);
      }
      return;
    }

    // KNET
    setTapPaying(true);
    try {
      const res = await createOrder({
        paymentMethod: 'ONLINE',
        paymentSource: 'KNET',
        shippingAddress: address,
        successUrl: `${window.location.origin}/${locale}/payment-callback`,
      });
      clearCartApi().catch(() => {});
      clearCart();
      const knetUrl = res.checkoutSession?.threeDSUrl;
      if (!knetUrl) {
        setTapError('No redirect URL returned from server');
        setTapPaying(false);
        return;
      }
      window.location.href = knetUrl;
    } catch (err: any) {
      setTapError(err.message || 'KNET payment failed');
      setTapPaying(false);
    }
  };

  const handleCloseModal = () => {
    if (tapPaying) return;
    setShowPaymentModal(false);
    setTapError('');
  };

  return (
    <>
      <Script
        src="https://tap-sdks.b-cdn.net/card/1.0.2/index.js"
        strategy="afterInteractive"
        onLoad={() => cardSDK.setCardScriptLoaded(true)}
      />
      <Script
        src="https://pay.google.com/gp/p/js/pay.js"
        strategy="afterInteractive"
        onLoad={() => gpaySDK.setGpayScriptLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://tap-sdks.b-cdn.net/apple-pay/build-1.2.0/main.css"
      />
      <Script
        src="https://tap-sdks.b-cdn.net/apple-pay/build-1.2.0/main.js"
        strategy="afterInteractive"
        onLoad={() => applePaySDK.setApplePayScriptLoaded(true)}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>

        {/* Shipping */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">{t('shipping_info')}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-text-secondary mb-1">{t('street')}</label>
              <input id="street" type="text" value={address.street} onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t('street')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-text-secondary mb-1">{t('city')}</label>
                <input id="city" type="text" value={address.city} onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={t('city')} />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-text-secondary mb-1">{t('state')}</label>
                <input id="state" type="text" value={address.state} onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={t('state')} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-text-secondary mb-1">{t('postal_code')}</label>
                <input id="postalCode" type="text" value={address.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={t('postal_code')} />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-text-secondary mb-1">{t('country')}</label>
                <input id="country" type="text" value={address.country} onChange={(e) => handleAddressChange('country', e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={t('country')} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">{t('payment')}</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-primary-light">
              <input type="radio" name="paymentMethod" value="ONLINE" checked={paymentMethod === 'ONLINE'}
                onChange={() => setPaymentMethod('ONLINE')}
                className="h-4 w-4 text-primary accent-primary" />
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">{t('online')}</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-primary-light">
              <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="h-4 w-4 text-primary accent-primary" />
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">{t('cod')}</span>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">{t('order_items')}</h2>
          <div className="space-y-3">
            {items.map((item) => {
              const itemTitle = getLocalized(item.title, locale);
              return (
                <div key={item.productId} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={item.thumbnail} alt={itemTitle} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{itemTitle}</p>
                    <p className="text-xs text-text-muted">{tCart('quantity')}: {item.quantity}</p>
                  </div>
                  <PriceDisplay price={item.price * item.quantity} size="sm" />
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>{tCart('items')} ({totalItems})</span>
              <span>{formatPrice(cartSummary?.subtotal ?? totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>{tCart('shipping')}</span>
              <span className="text-success font-medium">{tCommon('free')}</span>
            </div>
            {cartSummary && cartSummary.appliedLoyaltyDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary flex items-center gap-1">
                  <span aria-hidden>👑</span> Loyalty discount
                </span>
                <span className="text-success font-medium">−{formatPrice(cartSummary.appliedLoyaltyDiscount)}</span>
              </div>
            )}
            {cartSummary && cartSummary.appliedCouponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Coupon discount</span>
                <span className="text-success font-medium">−{formatPrice(cartSummary.appliedCouponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-text-primary pt-2 border-t border-border">
              <span>{tCart('total')}</span>
              <span className="text-primary">{formatPrice(cartSummary?.finalAmount ?? totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Loyalty redeem widget — only on checkout, after user proceeded */}
        {isAuthenticated && loyaltyInfo && (
          <LoyaltyRedeemWidget
            currentBalance={loyaltyInfo.currentBalance}
            maxPointsCanApply={loyaltyInfo.maxPointsCanApply}
            appliedPoints={loyaltyInfo.appliedPoints}
            onCartChange={refreshCart}
          />
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

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

      <PaymentModal
        isOpen={showPaymentModal}
        paymentSource={tapPaymentSource}
        cardSdkReady={cardSDK.cardSdkReady}
        cardFilled={cardSDK.cardFilled}
        gpayReady={gpaySDK.gpayReady}
        gpayAvailable={gpaySDK.gpayAvailable}
        applePayReady={applePaySDK.applePayReady}
        applePayAvailable={applePaySDK.applePayAvailable}
        paying={tapPaying}
        payError={tapError}
        onSelectSource={(src) => { setTapPaymentSource(src); setTapError(''); }}
        onPay={handlePay}
        onClose={handleCloseModal}
      />
    </>
  );
}
