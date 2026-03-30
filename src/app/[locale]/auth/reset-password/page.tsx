'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { sendOtp, resetPassword as resetPasswordApi } from '@/lib/apiClient';
import Button from '@/components/ui/Button';

type Step = 'email' | 'reset';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendOtp(email, 'password_reset');
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPasswordApi(email, otp, newPassword);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-bg-card rounded-xl border border-border p-8">
        <h1 className="text-2xl font-semibold text-text-primary text-center mb-6">
          {t('reset_password')}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              {t('send_otp')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-text-secondary text-center mb-2">
              {email}
            </p>

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

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                {t('password')}
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              {t('reset_password')}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary-hover font-medium"
          >
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
