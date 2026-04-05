'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { getProfile } from '@/services/authService';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import type { ProfileUserDto, ProfileAddressDto } from '@/types';

export default function ProfileContent() {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileUserDto | null>(null);
  const [addresses, setAddresses] = useState<ProfileAddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        // Profile response is now { user, addresses }
        const data = response.data;
        setProfile(data.user ?? data);
        setAddresses(data.addresses ?? []);
      } catch (err: any) {
        if (user) {
          setProfile({ id: user.id, name: user.username, email: user.email, phone: null, createdAt: user.createdAt, updatedAt: user.updatedAt });
        } else {
          setError(err.message || t('error_loading'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [mounted, isAuthenticated, user, t]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <p className="text-text-secondary text-lg mb-6">
          {t('login_required')}
        </p>
        <Link href="/auth/login">
          <Button size="lg">{tAuth('login')}</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 text-text-secondary">{t('loading_profile')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('personal_info')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-text-muted">{t('full_name')}</p>
            <p className="text-text-primary font-medium mt-0.5">
              {profile.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">{t('email')}</p>
            <p className="text-text-primary font-medium mt-0.5">
              {profile.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">{t('phone')}</p>
            <p className="text-text-primary font-medium mt-0.5">
              {profile.phone || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">{t('member_since')}</p>
            <p className="text-text-primary font-medium mt-0.5">
              {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t('addresses')}
        </h2>

        {addresses.length === 0 ? (
          <p className="text-text-muted text-sm">{t('no_addresses')}</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address: ProfileAddressDto) => (
              <div
                key={address.id}
                className="rounded-lg border border-border p-4 bg-gray-50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-text-secondary uppercase bg-gray-200 px-2 py-0.5 rounded">
                    {address.type}
                  </span>
                  {address.isDefault && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      {t('default_badge')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-text-secondary space-y-0.5">
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/orders">
          <Button variant="outline" size="sm">
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            My Orders
          </Button>
        </Link>
        <Link href="/wishlist">
          <Button variant="outline" size="sm">
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            My Wishlist
          </Button>
        </Link>
        <Link href="/support">
          <Button variant="outline" size="sm">
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
