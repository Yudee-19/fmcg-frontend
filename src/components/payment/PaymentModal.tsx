'use client';
import { useEffect } from 'react';
import { PaymentPanel } from './PaymentPanel';
import type { TapPaymentSource } from './PaymentPanel';

interface Props {
  isOpen: boolean;
  paymentSource: TapPaymentSource;
  cardSdkReady: boolean;
  cardFilled: boolean;
  gpayReady: boolean;
  gpayAvailable: boolean;
  applePayReady: boolean;
  applePayAvailable: boolean;
  paying: boolean;
  payError: string;
  onSelectSource: (src: TapPaymentSource) => void;
  onPay: () => void;
  onClose: () => void;
}

export function PaymentModal({
  isOpen,
  paymentSource,
  cardSdkReady,
  cardFilled,
  gpayReady,
  gpayAvailable,
  applePayReady,
  applePayAvailable,
  paying,
  payError,
  onSelectSource,
  onPay,
  onClose,
}: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    // Always in DOM — #tap-card-element must stay mounted for the SDK iframe
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center transition-all duration-300"
      style={{ pointerEvents: isOpen ? 'auto' : 'none', opacity: isOpen ? 1 : 0 }}
      inert={!isOpen ? true : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!paying ? onClose : undefined}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md bg-bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl transition-transform duration-300"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-sm font-medium text-text-primary">Complete Payment</span>
          <button
            onClick={onClose}
            disabled={paying}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-8">
          <PaymentPanel
            paymentSource={paymentSource}
            cardSdkReady={cardSdkReady}
            cardFilled={cardFilled}
            gpayReady={gpayReady}
            gpayAvailable={gpayAvailable}
            applePayReady={applePayReady}
            applePayAvailable={applePayAvailable}
            paying={paying}
            payError={payError}
            onSelectSource={onSelectSource}
            onPay={onPay}
          />
        </div>

        {/* Tap branding */}
        <div className="flex items-center justify-center gap-1.5 pb-6">
          <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-text-muted">Secured by </span>
          <span className="text-xs font-extrabold text-primary tracking-tight">tap</span>
          <span className="text-xs text-text-muted">payments</span>
        </div>
      </div>
    </div>
  );
}
