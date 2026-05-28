'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import apiClient from '@/services/apiClient';

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    const tapId = params.get('tap_id');

    if (!tapId) {
      router.replace('/');
      return;
    }

    apiClient
      .get(`/orders/verify-payment/${tapId}`)
      .then((res) => {
        const chargeStatus = res.data?.data?.chargeStatus;
        if (chargeStatus === 'CAPTURED') {
          setStatus('success');
          setTimeout(() => router.replace('/orders'), 2000);
        } else {
          setStatus('failed');
          setTimeout(() => router.replace('/checkout'), 3000);
        }
      })
      .catch(() => {
        setStatus('failed');
        setTimeout(() => router.replace('/checkout'), 3000);
      });
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-bg-card rounded-2xl shadow-sm border border-border p-8 max-w-sm w-full text-center space-y-4">
        {status === 'checking' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-text-primary">Verifying Payment…</h1>
            <p className="text-sm text-text-muted">Please wait a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-text-primary">Payment Successful!</h1>
            <p className="text-sm text-text-muted">Redirecting to your orders…</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-text-primary">Payment Not Confirmed</h1>
            <p className="text-sm text-text-muted">Redirecting back to checkout…</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
