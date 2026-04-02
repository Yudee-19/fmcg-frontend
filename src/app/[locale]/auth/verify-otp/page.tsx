'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { verifyOtp, sendOtp } from '@/lib/apiClient';
import Button from '@/components/ui/Button';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtpPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(email, otp);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0 || resending || !email) return;
    setResending(true);
    setError('');

    try {
      await sendOtp(email, 'registration');
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  }, [email, resendCooldown, resending]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-bg-card rounded-xl border border-border p-8">
        <h1 className="text-2xl font-semibold text-text-primary text-center mb-2">
          {t('verify_otp')}
        </h1>
        <p className="text-sm text-text-secondary text-center mb-6">
          {email}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t('otp')}
            </label>
            <input
              id="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            {t('verify_otp')}
          </Button>
        </form>

        {/* Resend OTP */}
        <div className="mt-4 text-center">
          {resendCooldown > 0 ? (
            <p className="text-sm text-text-muted">
              {t('resend_otp_in', { seconds: resendCooldown })}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-sm text-primary hover:text-primary-hover font-medium disabled:opacity-50"
            >
              {resending ? '...' : t('resend_otp')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
