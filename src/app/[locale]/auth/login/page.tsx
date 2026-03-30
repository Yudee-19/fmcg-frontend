'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { login as loginApi } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      setAuth(data.data.user, data.data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-bg-card rounded-xl border border-border p-8">
        <h1 className="text-2xl font-semibold text-text-primary text-center mb-6">
          {t('login')}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/reset-password"
              className="text-sm text-primary hover:text-primary-hover"
            >
              {t('forgot_password')}
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            {t('login')}
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
      </div>
    </div>
  );
}
