'use client';

export type TapPaymentSource = 'CARD' | 'KNET' | 'GOOGLE_PAY' | 'APPLE_PAY';

interface Props {
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
}

const METHODS: { id: TapPaymentSource; label: string }[] = [
  { id: 'CARD', label: '💳 Card' },
  { id: 'KNET', label: '🏦 Knet' },
  { id: 'GOOGLE_PAY', label: 'G Pay' },
  { id: 'APPLE_PAY', label: ' Pay' },
];

export function PaymentPanel({
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
}: Props) {
  const showPayButton =
    paymentSource !== 'GOOGLE_PAY' && paymentSource !== 'APPLE_PAY';

  return (
    <div className="space-y-4">
      {/* Method selector */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Payment method
        </p>
        <div className="flex gap-2">
          {METHODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onSelectSource(id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                paymentSource === id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-text-secondary border-border hover:border-primary hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Card SDK mount point — always in DOM so the iframe stays alive */}
      <div
        className={`relative transition-all duration-200 ${
          paymentSource === 'CARD'
            ? 'border border-border rounded-2xl p-3'
            : 'h-0 overflow-hidden border-0 p-0'
        }`}
      >
        <div
          id="tap-card-element"
          style={{ minHeight: paymentSource === 'CARD' ? 180 : 0 }}
        />

        {paymentSource === 'CARD' && !cardSdkReady && (
          <div className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center gap-2.5">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-xs text-text-muted">Loading card form…</p>
          </div>
        )}

        {paymentSource === 'CARD' && cardSdkReady && paying && (
          <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center gap-2.5">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-xs text-text-secondary font-medium">Securing your payment…</p>
          </div>
        )}
      </div>

      {/* Knet info */}
      {paymentSource === 'KNET' && (
        <div className="flex items-start gap-3 bg-bg-card border border-border rounded-2xl px-4 py-4">
          <span className="text-xl mt-0.5">🏦</span>
          <div>
            <p className="text-sm font-semibold text-text-primary">Knet Payment</p>
            <p className="text-xs text-text-muted mt-0.5">
              You will be securely redirected to the Knet payment page to complete your transaction.
            </p>
          </div>
        </div>
      )}

      {/* Google Pay button mount point */}
      <div className={paymentSource === 'GOOGLE_PAY' ? 'block' : 'hidden'}>
        <div className="border border-border rounded-2xl p-4 bg-white space-y-3">
          <div id="tap-gpay-element" className="min-h-[44px] flex items-center justify-center" />
          {!gpayReady && (
            <p className="text-xs text-text-muted text-center">Loading Google Pay…</p>
          )}
          {gpayReady && !gpayAvailable && (
            <p className="text-xs text-red-600 text-center">
              Google Pay is not available on this device or browser.
            </p>
          )}
          {gpayReady && gpayAvailable && (
            <p className="text-xs text-text-muted text-center">
              Tap the button above to pay with Google Pay
            </p>
          )}
        </div>
      </div>

      {/* Apple Pay button mount point */}
      <div className={paymentSource === 'APPLE_PAY' ? 'block' : 'hidden'}>
        <div className="border border-border rounded-2xl p-4 bg-white space-y-3">
          <div id="tap-applepay-element" className="min-h-[44px] flex items-center justify-center" />
          {!applePayReady && (
            <p className="text-xs text-text-muted text-center">Loading Apple Pay…</p>
          )}
          {applePayReady && !applePayAvailable && (
            <p className="text-xs text-red-600 text-center">
              Apple Pay is only available in Safari on macOS/iOS with a card configured in Wallet.
            </p>
          )}
          {applePayReady && applePayAvailable && (
            <p className="text-xs text-text-muted text-center">
              Tap the button above to pay with Apple Pay
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {payError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">
          <span className="text-red-500 mt-0.5 text-xs">✕</span>
          <p className="text-xs text-red-600">{payError}</p>
        </div>
      )}

      {/* Hint when card form not yet filled */}
      {paymentSource === 'CARD' && cardSdkReady && !cardFilled && !paying && !payError && (
        <p className="text-xs text-text-muted text-center">
          Enter your card details to continue
        </p>
      )}

      {/* Pay button — hidden for Google Pay (its own button handles tap) */}
      {showPayButton && (
        <button
          onClick={onPay}
          disabled={paying || (paymentSource === 'CARD' && (!cardSdkReady || !cardFilled))}
          className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-hover disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {paying ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-white text-sm font-medium">Processing…</span>
            </>
          ) : (
            <span className="text-white text-sm font-medium">
              {paymentSource === 'CARD' ? 'Pay with Card' : 'Pay with Knet'}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
