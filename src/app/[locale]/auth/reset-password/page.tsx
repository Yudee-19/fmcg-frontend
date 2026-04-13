'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { sendOtp, resetPassword as resetPasswordApi } from '@/services/authService';
import Button from '@/components/ui/Button';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

type Step = 'email' | 'reset';

const inputClass =
  'w-full rounded-xl border border-border bg-white/90 py-3 pl-11 pr-12 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || t('send_otp_failed'));
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
      setError(err.message || t('reset_password_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-13rem)] overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,30,58,0.15),_transparent_33%),radial-gradient(circle_at_bottom_right,_rgba(195,58,88,0.15),_transparent_30%)]" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.02fr_minmax(0,30rem)]">
        <section className="hidden lg:block">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              {t('reset_password_badge')}
            </span>

            <div className="space-y-4">
              <h1 className="font-poppins text-4xl font-semibold leading-tight text-text-primary xl:text-5xl">
                {t('reset_password_heading')}
              </h1>
              <p className="max-w-lg text-base leading-7 text-text-secondary xl:text-lg">
                {t('reset_password_subtitle')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[t('reset_password_feature_code'), t('reset_password_feature_secure'), t('reset_password_feature_fast'), t('reset_password_feature_account')].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-medium text-text-primary shadow-sm backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="w-full rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_24px_80px_rgba(95,20,34,0.12)] backdrop-blur sm:p-8">
          <div className="mb-8 space-y-3 text-center lg:text-left">
            <span className="inline-flex items-center justify-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {t('reset_password')}
            </span>
            <h2 className="font-poppins text-3xl font-semibold text-text-primary">
              {step === 'email' ? t('reset_password_start_title') : t('reset_password_finish_title')}
            </h2>
            <p className="text-sm leading-6 text-text-secondary">
              {step === 'email' ? t('reset_password_start_desc') : t('reset_password_finish_desc')}
            </p>
          </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.22)]"
            >
              <span className="inline-flex items-center gap-2">
                {t('send_otp')}
                <ArrowRight className="h-4.5 w-4.5" />
              </span>
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <p className="rounded-2xl border border-primary/10 bg-primary-light px-4 py-3 text-center text-sm text-text-secondary">
              {email}
            </p>

            <div>
              <label
                htmlFor="otp"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                {t('otp')}
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${inputClass} text-center text-lg tracking-[0.38em]`}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                {t('password')}
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light hover:text-primary"
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.22)]"
            >
              <span className="inline-flex items-center gap-2">
                {t('reset_password')}
                <ArrowRight className="h-4.5 w-4.5" />
              </span>
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

          <p className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-text-muted">
            {t('reset_password_footer_note')}
          </p>
        </div>
      </div>
    </div>
  );
}
