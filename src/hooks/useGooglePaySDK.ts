'use client';
import { useState, useRef, useCallback } from 'react';

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: { environment: 'TEST' | 'PRODUCTION' }) => GPayClient;
        };
      };
    };
  }
}

interface GPayClient {
  isReadyToPay: (req: object) => Promise<{ result: boolean }>;
  createButton: (config: { onClick: () => void; buttonColor?: string; buttonType?: string; buttonSizeMode?: string }) => HTMLElement;
  loadPaymentData: (req: object) => Promise<{
    paymentMethodData: {
      tokenizationData: { token: string };
    };
  }>;
}

const BASE_REQUEST = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

const ALLOWED_CARD_NETWORKS = ['MASTERCARD', 'VISA', 'AMEX'];
const ALLOWED_AUTH_METHODS = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

export function useGooglePaySDK() {
  const [gpayScriptLoaded, setGpayScriptLoaded] = useState(false);
  const [gpayReady, setGpayReady] = useState(false);
  const [gpayAvailable, setGpayAvailable] = useState(false);
  const clientRef = useRef<GPayClient | null>(null);

  const init = useCallback(
    async (
      amount: number,
      onToken: (token: string) => void,
      onError: (msg: string) => void,
    ) => {
      if (!window.google?.payments?.api) {
        onError('Google Pay SDK not loaded');
        return;
      }

      const environment: 'TEST' | 'PRODUCTION' =
        (process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY || '').startsWith('pk_live')
          ? 'PRODUCTION'
          : 'TEST';

      const client = new window.google.payments.api.PaymentsClient({ environment });
      clientRef.current = client;

      const tokenizationSpecification = {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'tappayments',
          gatewayMerchantId: process.env.NEXT_PUBLIC_TAP_MERCHANT_ID || '',
        },
      };

      const cardPaymentMethod = {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ALLOWED_AUTH_METHODS,
          allowedCardNetworks: ALLOWED_CARD_NETWORKS,
        },
        tokenizationSpecification,
      };

      const isReadyReq = {
        ...BASE_REQUEST,
        allowedPaymentMethods: [
          { type: 'CARD', parameters: cardPaymentMethod.parameters },
        ],
      };

      try {
        const { result } = await client.isReadyToPay(isReadyReq);
        setGpayAvailable(result);
        if (!result) {
          onError('Google Pay is not available on this device/browser');
          return;
        }
      } catch (err: any) {
        console.error('[GPaySDK] isReadyToPay failed:', err);
        onError('Failed to initialize Google Pay');
        return;
      }

      const currency = process.env.NEXT_PUBLIC_TAP_CURRENCY || 'KWD';
      const paymentRequest = {
        ...BASE_REQUEST,
        allowedPaymentMethods: [cardPaymentMethod],
        merchantInfo: {
          merchantName: 'Crown Mart',
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          // Google Pay rejects 3-decimal totalPrice with OR_BIBED_06 even for KWD.
          // We always send 2 decimals here; Google's sheet still formats display
          // as "KWD 3.000" using its own currency-aware formatter.
          // Backend charges the real KWD amount via Tap's /v2/charges.
          totalPrice: amount.toFixed(2),
          currencyCode: currency,
          countryCode: currency === 'KWD' ? 'KW' : 'AE',
        },
      };

      const container = document.getElementById('tap-gpay-element');
      if (!container) return;
      container.innerHTML = '';

      const button = client.createButton({
        buttonColor: 'black',
        buttonType: 'pay',
        buttonSizeMode: 'fill',
        onClick: async () => {
          try {
            const paymentData = await client.loadPaymentData(paymentRequest);
            const token = paymentData.paymentMethodData.tokenizationData.token;
            onToken(token);
          } catch (err: any) {
            if (err?.statusCode === 'CANCELED') return;
            console.error('[GPaySDK] loadPaymentData failed:', err);
            onError(err?.statusMessage || err?.message || 'Google Pay failed');
          }
        },
      });

      container.appendChild(button);
      setGpayReady(true);
    },
    [],
  );

  const reset = () => {
    setGpayReady(false);
    const container = document.getElementById('tap-gpay-element');
    if (container) container.innerHTML = '';
  };

  return {
    gpayScriptLoaded,
    setGpayScriptLoaded,
    gpayReady,
    gpayAvailable,
    init,
    reset,
  };
}
