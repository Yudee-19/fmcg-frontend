'use client';
import { useState, useRef, useCallback } from 'react';

declare global {
  interface Window {
    TapApplepaySDK?: {
      render: (config: object, containerId: string) => void;
      abortApplePaySession?: () => void;
    };
    ApplePaySession?: {
      canMakePayments: () => boolean;
      canMakePaymentsWithActiveCard: (merchantId: string) => Promise<boolean>;
    };
  }
}

interface ApplePayUser {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  username?: string;
}

export function useApplePaySDK() {
  const [applePayScriptLoaded, setApplePayScriptLoaded] = useState(false);
  const [applePayReady, setApplePayReady] = useState(false);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const initializedFor = useRef<number | null>(null);

  const init = useCallback(
    (
      user: ApplePayUser,
      amount: number,
      onToken: (token: string) => void,
      onError: (msg: string) => void,
      onCancel?: () => void,
    ) => {
      if (!window.TapApplepaySDK) {
        onError('Apple Pay SDK not loaded');
        return;
      }

      // Apple Pay requires HTTPS — calling canMakePayments() on HTTP throws
      // "InvalidAccessError: Trying to start an Apple Pay session from an
      // insecure document". Guard the entire check so we don't crash.
      if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
        setApplePayAvailable(false);
        setApplePayReady(true);
        onError('Apple Pay requires HTTPS — open the site via your ngrok URL');
        return;
      }

      // Apple Pay is only available in Safari on macOS/iOS
      let canPay = false;
      try {
        canPay =
          typeof window.ApplePaySession !== 'undefined' &&
          !!window.ApplePaySession.canMakePayments?.();
      } catch (err) {
        console.error('[ApplePaySDK] canMakePayments threw:', err);
        canPay = false;
      }

      if (!canPay) {
        setApplePayAvailable(false);
        setApplePayReady(true);
        onError('Apple Pay is not available on this device or browser');
        return;
      }
      setApplePayAvailable(true);

      // Clear previous mount
      const container = document.getElementById('tap-applepay-element');
      if (container) container.innerHTML = '';

      const environment: 'production' | 'development' =
        (process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY || '').startsWith('pk_live')
          ? 'production'
          : 'development';

      const currency = process.env.NEXT_PUBLIC_TAP_CURRENCY || 'KWD';
      // Apple Pay accepts string with native currency precision (KWD = 3 decimals)
      const amountStr = amount.toFixed(currency === 'KWD' ? 3 : 2);
      initializedFor.current = amount;

      const nameOnCard =
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.username ||
        user.email.split('@')[0];

      const config = {
        debug: false,
        scope: 'TapToken',
        publicKey: process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY,
        environment,
        merchant: {
          // Apple validates against the registered domain; use the current host
          domain: typeof window !== 'undefined' ? window.location.hostname : '',
          id: process.env.NEXT_PUBLIC_TAP_MERCHANT_ID || '',
        },
        acceptance: {
          supportedBrands: ['mada', 'masterCard', 'visa'],
        },
        features: {
          supportsCouponCode: false,
        },
        transaction: {
          currency,
          amount: amountStr,
        },
        customer: {
          name: [
            {
              locale: 'en',
              first: user.firstName || user.username || nameOnCard,
              middle: '',
              last: user.lastName || '',
            },
          ],
          contact: {
            email: user.email,
            phone: {
              number: user.phoneNumber || '50000000',
              countryCode: user.countryCode || '+965',
            },
          },
        },
        interface: {
          locale: 'en',
          theme: 'light',
          type: 'buy',
          edges: 'curved',
        },
        onReady: () => {
          setApplePayReady(true);
        },
        onSuccess: (data: { id: string }) => {
          if (data?.id) onToken(data.id);
          else onError('Apple Pay returned no token');
        },
        onError: (err: unknown) => {
          console.error('[ApplePaySDK] onError:', err);
          const msg =
            typeof err === 'string'
              ? err
              : (err as any)?.message || (err as any)?.description || 'Apple Pay failed';
          onError(msg);
        },
        onCancel: () => {
          if (onCancel) onCancel();
        },
        onMerchantValidation: (status: string) => {
          if (status === 'error') {
            onError('Apple Pay merchant validation failed — domain may not be registered with Tap');
          }
        },
      };

      try {
        window.TapApplepaySDK.render(config, 'tap-applepay-element');
      } catch (err) {
        console.error('[ApplePaySDK] render threw:', err);
        onError('Failed to initialize Apple Pay');
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setApplePayReady(false);
    initializedFor.current = null;
    try {
      window.TapApplepaySDK?.abortApplePaySession?.();
    } catch {}
    const container = document.getElementById('tap-applepay-element');
    if (container) container.innerHTML = '';
  }, []);

  return {
    applePayScriptLoaded,
    setApplePayScriptLoaded,
    applePayReady,
    applePayAvailable,
    init,
    reset,
  };
}
