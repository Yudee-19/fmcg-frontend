'use client';
import { useState, useRef, useCallback } from 'react';

declare global {
  interface Window {
    CardSDK: {
      renderTapCard: (containerId: string, config: object) => void;
      tokenize: () => Promise<{ id: string }>;
    };
  }
}

interface CardUser {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  username?: string;
}

function extractSdkError(data: unknown): string {
  if (!data) return 'Card error';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const msg =
      (d.message as string) ||
      (d.description as string) ||
      ((d.error as Record<string, unknown>)?.description as string) ||
      ((d.error as Record<string, unknown>)?.message as string);
    if (msg) return msg;
  }
  console.error('[TapCardSDK] onError full payload:', JSON.stringify(data));
  return 'Card payment error — check console for details';
}

export function useCardSDK() {
  const [cardScriptLoaded, setCardScriptLoaded] = useState(false);
  const [cardSdkReady, setCardSdkReady] = useState(false);
  const [cardFilled, setCardFilled] = useState(false);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const init = useCallback(
    (
      user: CardUser,
      onToken: (id: string) => void,
      onError: (msg: string) => void,
    ) => {
      if (!window.CardSDK) return;

      // Clear any previous SDK iframe so re-init works cleanly
      // (handles React StrictMode double-invoke and modal close/reopen)
      const container = document.getElementById('tap-card-element');
      if (container) container.innerHTML = '';

      setCardSdkReady(false);
      setCardFilled(false);

      if (readyTimer.current) clearTimeout(readyTimer.current);

      const nameOnCard =
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.username ||
        user.email.split('@')[0];

      try {
        window.CardSDK.renderTapCard('tap-card-element', {
          publicKey: process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY,
          scope: 'Token',
          purpose: 'Transaction',
          transaction: {
            amount: 1,
            currency: process.env.NEXT_PUBLIC_TAP_CURRENCY || 'KWD',
          },
          customer: {
            name: [
              {
                lang: 'en',
                first: user.firstName || user.username || nameOnCard,
                middle: '',
                last: user.lastName || '',
              },
            ],
            nameOnCard,
            editable: true,
            contact: {
              email: user.email,
              phone: {
                countryCode: (user.countryCode || '+965').replace('+', ''),
                number: user.phoneNumber || '50000000',
              },
            },
          },
          acceptance: {
            supportedBrands: ['VISA', 'MASTERCARD', 'MADA', 'AMEX'],
            supportedCards: 'ALL',
          },
          fields: { cardHolder: true },
          addons: {
            displayPaymentBrands: true,
            loader: true,
            saveCard: false,
            autoSaveCard: false,
          },
          interface: {
            locale: 'en',
            theme: 'light',
            edges: 'curved',
            direction: 'ltr',
          },
          onReady: () => {
            if (readyTimer.current) clearTimeout(readyTimer.current);
            setCardSdkReady(true);
          },
          onSuccess: (data: { id: string }) => onToken(data.id),
          onError: (data: unknown) => {
            const msg = extractSdkError(data);
            console.error('[TapCardSDK] onError:', msg, data);
            onError(msg);
          },
          // Tap SDK fires this with the boolean validity of the entire form
          // (verified by inspecting the SDK bundle: isAllInputsValid → onValidInput(r))
          onValidInput: (isValid: unknown) => setCardFilled(Boolean(isValid)),
        });
      } catch (err) {
        console.error('[TapCardSDK] renderTapCard threw:', err);
        onError('Failed to initialize card form');
        return;
      }

      // Fallback — SDK sometimes skips onReady on localhost/dev
      readyTimer.current = setTimeout(() => setCardSdkReady(true), 3500);
    },
    [],
  );

  const tokenize = async () => {
    await window.CardSDK.tokenize();
  };

  const reset = () => {
    if (readyTimer.current) {
      clearTimeout(readyTimer.current);
      readyTimer.current = null;
    }
    setCardSdkReady(false);
    setCardFilled(false);
    // Clear the container so next init starts fresh
    const container = document.getElementById('tap-card-element');
    if (container) container.innerHTML = '';
  };

  return {
    cardScriptLoaded,
    setCardScriptLoaded,
    cardSdkReady,
    cardFilled,
    init,
    tokenize,
    reset,
  };
}
