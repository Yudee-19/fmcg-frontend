'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { login as loginApi } from '@/services/authService';
import { getCart } from '@/services/cartService';
import { ApiError } from '@/services/apiError';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-border bg-white/90 py-3 pl-11 pr-12 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const syncCart = useCartStore((s) => s.syncWithServer);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      setAuth(data.data.user, data.data.token);

      // Pull this user's server-side cart into the local store so items
      // saved before logout reappear after re-login.
      try {
        const cartRes = await getCart();
        const items = cartRes.data?.items ?? [];
        const total =
          (cartRes as any)?.cartSummary?.finalAmount ??
          (cartRes as any)?.cartSummary?.subtotal ??
          items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
        syncCart(items, total);
      } catch {
        // user has no server cart yet, or fetch failed — leave store as-is
      }

      router.push('/');
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'ACCOUNT_NOT_ACTIVE') {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(err.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-13rem)] overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,30,58,0.15),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(195,58,88,0.16),_transparent_28%)]" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_minmax(0,30rem)]">
        <section className="hidden lg:block">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              {t('login_badge')}
            </span>

            <div className="space-y-4">
              <h1 className="font-poppins text-4xl font-semibold leading-tight text-text-primary xl:text-5xl">
                {t('login_heading')}
              </h1>
              <p className="max-w-lg text-base leading-7 text-text-secondary xl:text-lg">
                {t('login_subtitle')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[t('login_feature_fast'), t('login_feature_secure'), t('login_feature_orders'), t('login_feature_support')].map((item) => (
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
              {t('login')}
            </span>
            <h2 className="font-poppins text-3xl font-semibold text-text-primary">
              {t('welcome_back')}
            </h2>
            <p className="text-sm leading-6 text-text-secondary">
              {t('login_card_subtitle')}
            </p>
          </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              {t('password')}
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="flex justify-end">
            <Link
              href="/auth/reset-password"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              {t('forgot_password')}
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="lg"
            className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.22)]"
          >
            <span className="inline-flex items-center gap-2">
              {t('login')}
              <ArrowRight className="h-4.5 w-4.5" />
            </span>
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {t('no_account')}{' '}
          <Link
            href="/auth/register"
            className="text-primary hover:text-primary-hover font-medium"
          >
            {t('register')}
          </Link>
        </p>

          <p className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-text-muted">
            {t('login_footer_note')}
          </p>
        </div>
      </div>
    </div>
  );
}
