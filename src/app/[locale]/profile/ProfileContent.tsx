
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Heart,
  Home,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  MapPinned,
  Package,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getProfile, logout, updateProfile } from '@/services/authService';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/services/addressService';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link, useRouter } from '@/i18n/navigation';
import type { Address, ProfileAddressDto, ProfileUserDto, User } from '@/types';

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

type AddressFormState = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: Address['addressType'];
};

type ActiveModal = 'profile' | 'password' | 'address' | null;

const inputClass =
  'w-full rounded-xl border border-border bg-white/95 py-3 pl-11 pr-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

const selectClass =
  'w-full rounded-xl border border-border bg-white/95 px-4 py-3 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

const emptyAddressForm: AddressFormState = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
  addressType: 'home',
};

const countryCodes = [
  '+91',
  '+1',
  '+44',
  '+61',
  '+81',
  '+49',
  '+33',
  '+86',
  '+971',
  '+966',
  '+65',
  '+60',
  '+62',
  '+55',
  '+27',
];

function splitName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function normalizeAddressType(
  value: string | undefined
): Address['addressType'] {
  switch (value) {
    case 'home':
    case 'work':
    case 'billing':
    case 'shipping':
      return value;
    default:
      return 'home';
  }
}

function mapProfileAddress(address: ProfileAddressDto, userId: string): Address {
  return {
    id: address.id,
    userId,
    street: address.street,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    addressType: normalizeAddressType(address.type),
    createdAt: '',
    updatedAt: '',
  };
}

function getProfileSnapshot(user: User | null, fallback?: ProfileUserDto | null) {
  const derivedName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username
    : fallback?.name ?? '';

  return {
    firstName: user?.firstName ?? splitName(derivedName).firstName,
    lastName: user?.lastName ?? splitName(derivedName).lastName,
    phoneNumber: user?.phoneNumber ?? fallback?.phone ?? '',
    countryCode: user?.countryCode ?? '+91',
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function StatusBanner({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) {
    return null;
  }

  const isSuccess = feedback.type === 'success';

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700',
      ].join(' ')}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      ) : (
        <CircleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      )}
      <p>{feedback.message}</p>
    </div>
  );
}

function ModalShell({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/70 bg-white/96 shadow-[0_28px_90px_rgba(19,18,22,0.28)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[30px] border-b border-border/70 bg-white/95 px-6 py-5 backdrop-blur sm:px-7">
          <div>
            <h2 className="font-poppins text-2xl font-semibold text-text-primary">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

export default function ProfileContent() {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const tOrder = useTranslations('order');
  const tWishlist = useTranslations('wishlist');
  const tSupport = useTranslations('support');
  const tCommon = useTranslations('common');

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileUserDto | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [defaultingAddressId, setDefaultingAddressId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [confirmDeleteAddress, setConfirmDeleteAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null);
  const [addressFeedback, setAddressFeedback] = useState<FeedbackState>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+91',
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      setError('');

      const [profileResult, addressResult] = await Promise.allSettled([
        getProfile(),
        getAddresses(),
      ]);

      let nextProfile: ProfileUserDto | null = null;
      let nextAddresses: Address[] = [];
      let nextError = '';

      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data;
        nextProfile = data.user ?? data;
      } else if (user) {
        nextProfile = {
          id: user.id,
          name:
            [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
            user.username,
          email: user.email,
          phone: user.phoneNumber || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      } else {
        nextError = profileResult.reason?.message || t('error_loading');
      }

      if (addressResult.status === 'fulfilled') {
        nextAddresses = addressResult.value.data;
      } else if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data;
        nextAddresses = Array.isArray(data.addresses)
          ? data.addresses.map((address: ProfileAddressDto) =>
              mapProfileAddress(address, nextProfile?.id ?? user?.id ?? '')
            )
          : [];
        setAddressFeedback({
          type: 'error',
          message: t('address_load_failed'),
        });
      }

      if (nextProfile) {
        setProfile(nextProfile);
        setProfileForm(getProfileSnapshot(user, nextProfile));
      }

      setAddresses(nextAddresses);
      setError(nextError);
      setLoading(false);
    };

    void fetchProfileData();
  }, [mounted, isAuthenticated, user, t]);

  const refreshAddresses = async () => {
    const response = await getAddresses();
    setAddresses(response.data);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError('');

    try {
      await logout();
    } catch {
      // Keep local logout resilient if the API call fails.
    } finally {
      clearAuth();
      clearCart();
      clearWishlist();
      router.push('/auth/login');
      setLoggingOut(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileFeedback(null);
    setSavingProfile(true);

    try {
      const firstName = profileForm.firstName.trim();
      const lastName = profileForm.lastName.trim();
      const phoneNumber = profileForm.phoneNumber.trim();

      // Backend update-profile accepts: username, phoneNumber, whatsappNumber,
      // currentPassword, newPassword. firstName/lastName/countryCode are kept
      // client-side only until backend exposes them.
      await updateProfile({ phoneNumber: phoneNumber || undefined });

      updateUser({ firstName, lastName, phoneNumber });
      setProfile((current) =>
        current
          ? {
              ...current,
              name: [firstName, lastName].filter(Boolean).join(' ').trim(),
              phone: phoneNumber || null,
              updatedAt: new Date().toISOString(),
            }
          : current
      );
      setActiveModal(null);
      setProfileFeedback({ type: 'success', message: t('profile_saved') });
    } catch (error: unknown) {
      setProfileFeedback({
        type: 'error',
        message: getErrorMessage(error, t('profile_save_failed')),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordFeedback(null);

    if (!passwordForm.oldPassword || !passwordForm.password) {
      setPasswordFeedback({ type: 'error', message: t('password_required') });
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: t('password_mismatch') });
      return;
    }

    setSavingPassword(true);

    try {
      await updateProfile({
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.password,
      });
      setPasswordForm({ oldPassword: '', password: '', confirmPassword: '' });
      setActiveModal(null);
      setPasswordFeedback({ type: 'success', message: t('password_saved') });
    } catch (error: unknown) {
      setPasswordFeedback({
        type: 'error',
        message: getErrorMessage(error, t('password_save_failed')),
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddressSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressFeedback(null);
    setSavingAddress(true);

    try {
      const payload = {
        street: addressForm.street.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim(),
        isDefault: addressForm.isDefault,
        addressType: addressForm.addressType,
      };

      if (editingAddressId) {
        await updateAddress(editingAddressId, payload);
      } else {
        await createAddress(payload);
      }

      await refreshAddresses();
      setAddressForm(emptyAddressForm);
      setEditingAddressId(null);
      setActiveModal(null);
      setAddressFeedback({ type: 'success', message: t('address_saved') });
    } catch (error: unknown) {
      setAddressFeedback({
        type: 'error',
        message: getErrorMessage(error, t('address_save_failed')),
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      addressType: address.addressType,
    });
    setAddressFeedback(null);
    setActiveModal('address');
  };

  const handleDeleteAddress = async () => {
    if (!confirmDeleteAddress) {
      return;
    }

    setAddressFeedback(null);
    setDeletingAddressId(confirmDeleteAddress.id);

    try {
      await deleteAddress(confirmDeleteAddress.id);
      await refreshAddresses();
      if (editingAddressId === confirmDeleteAddress.id) {
        setEditingAddressId(null);
        setAddressForm(emptyAddressForm);
      }
      setConfirmDeleteAddress(null);
      setAddressFeedback({ type: 'success', message: t('address_deleted') });
    } catch (error: unknown) {
      setAddressFeedback({
        type: 'error',
        message: getErrorMessage(error, t('address_delete_failed')),
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setAddressFeedback(null);
    setDefaultingAddressId(addressId);

    try {
      await setDefaultAddress(addressId);
      await refreshAddresses();
      setAddressFeedback({ type: 'success', message: t('default_updated') });
    } catch (error: unknown) {
      setAddressFeedback({
        type: 'error',
        message: getErrorMessage(error, t('default_update_failed')),
      });
    } finally {
      setDefaultingAddressId(null);
    }
  };

  const resetAddressEditor = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setAddressFeedback(null);
  };

  const openProfileModal = () => {
    setProfileFeedback(null);
    setActiveModal('profile');
  };

  const openPasswordModal = () => {
    setPasswordFeedback(null);
    setPasswordForm({ oldPassword: '', password: '', confirmPassword: '' });
    setActiveModal('password');
  };

  const openAddressModal = () => {
    resetAddressEditor();
    setActiveModal('address');
  };

  const addressTypeLabel = (value: Address['addressType']) => {
    switch (value) {
      case 'home':
        return t('address_type_home');
      case 'work':
        return t('address_type_work');
      case 'billing':
        return t('address_type_billing');
      case 'shipping':
        return t('address_type_shipping');
      default:
        return value;
    }
  };

  const featuredAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const featuredAddressPreview = featuredAddress
    ? [featuredAddress.street, featuredAddress.city].filter(Boolean).join(', ')
    : t('no_addresses');

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-52 rounded-[28px]" />
        <Skeleton className="h-80 rounded-[28px]" />
        <Skeleton className="h-72 rounded-[28px]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-[28px] border border-border bg-bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <UserRound className="h-8 w-8" />
        </div>
        <p className="mb-6 text-lg text-text-secondary">{t('login_required')}</p>
        <Link href="/auth/login">
          <Button size="lg">{tAuth('login')}</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-text-secondary">{t('loading_profile')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/88 p-6 shadow-[0_24px_80px_rgba(95,20,34,0.12)] backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,30,58,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(195,58,88,0.16),_transparent_26%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              {t('hero_badge')}
            </span>

            <div className="space-y-2">
              <h2 className="font-poppins text-3xl font-semibold text-text-primary sm:text-4xl">
                {profile.name}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                {t('hero_title')}
              </p>
              <p className="text-sm text-text-muted">{t('hero_subtitle')}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={loggingOut}
            onClick={handleLogout}
            className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.18)]"
          >
            {tAuth('logout')}
          </Button>
        </div>

        <div className="relative mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/70 bg-white/82 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              {t('member_since')}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-text-primary">{formatDate(profile.createdAt)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/82 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              {t('address_count', { count: addresses.length })}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <MapPinned className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-text-primary">{featuredAddressPreview}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/82 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              {t('default_address')}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Star className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-text-primary">
                {addresses.find((address) => address.isDefault)?.city ?? t('no_addresses')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {profileFeedback || passwordFeedback || addressFeedback ? (
        <div className="space-y-3">
          <StatusBanner feedback={profileFeedback} />
          <StatusBanner feedback={passwordFeedback} />
          <StatusBanner feedback={addressFeedback} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_64px_rgba(95,20,34,0.08)] backdrop-blur sm:p-7">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('personal_info')}</h2>
              <p className="mt-1 text-sm text-text-secondary">{t('contact_details_hint')}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {tAuth('first_name')}
                </p>
                <p className="mt-2 text-base font-medium text-text-primary">
                  {profileForm.firstName || '-'}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {tAuth('last_name')}
                </p>
                <p className="mt-2 text-base font-medium text-text-primary">
                  {profileForm.lastName || '-'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {t('email')}
                </p>
                <p className="mt-2 text-base font-medium text-text-primary break-all">
                  {profile.email}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {t('phone')}
                </p>
                <p className="mt-2 text-base font-medium text-text-primary">
                  {[profileForm.countryCode, profileForm.phoneNumber].filter(Boolean).join(' ') || '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" size="lg" onClick={openProfileModal} className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.18)]">
                <span className="inline-flex items-center gap-2">
                  <Pencil className="h-4.5 w-4.5" />
                  {t('edit_profile_cta')}
                </span>
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_64px_rgba(95,20,34,0.08)] backdrop-blur sm:p-7">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('security')}</h2>
              <p className="mt-1 text-sm text-text-secondary">{t('security_hint')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/10 bg-primary-light/60 p-4 text-sm text-text-secondary">
              {t('security_hint')}
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                {t('security')}
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {t('password_card_hint')}
              </p>
            </div>
            <Button type="button" size="lg" onClick={openPasswordModal} className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.18)]">
              <span className="inline-flex items-center gap-2">
                <KeyRound className="h-4.5 w-4.5" />
                {t('reset_password_cta')}
              </span>
            </Button>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_64px_rgba(95,20,34,0.08)] backdrop-blur sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('address_book')}</h2>
              <p className="mt-1 text-sm text-text-secondary">{t('addresses_hint')}</p>
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={openAddressModal} className="rounded-xl">
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4.5 w-4.5" />
              {t('add_address_cta')}
            </span>
          </Button>
        </div>

        <div className="mt-6 space-y-4">
            {addresses.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-white/70 p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <MapPinned className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{t('empty_address_title')}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{t('empty_address_desc')}</p>
              </div>
            ) : (
              addresses.map((address) => (
                <article
                  key={address.id}
                  className="rounded-[24px] border border-white/80 bg-white/92 p-5 shadow-[0_14px_40px_rgba(95,20,34,0.06)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          {address.addressType === 'home' ? (
                            <Home className="h-3.5 w-3.5" />
                          ) : (
                            <BriefcaseBusiness className="h-3.5 w-3.5" />
                          )}
                          {addressTypeLabel(address.addressType)}
                        </span>
                        {address.isDefault ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            <Star className="h-3.5 w-3.5" />
                            {t('default_badge')}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 space-y-1.5 text-sm text-text-secondary">
                        <p className="font-medium text-text-primary">{address.street}</p>
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:max-w-[15rem] sm:justify-end">
                      {!address.isDefault ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          loading={defaultingAddressId === address.id}
                          onClick={() => handleSetDefault(address.id)}
                          className="rounded-xl"
                        >
                          {t('set_default')}
                        </Button>
                      ) : null}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        className="rounded-xl"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Pencil className="h-4 w-4" />
                          {tCommon('edit')}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDeleteAddress(address)}
                        className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          {tCommon('delete')}
                        </span>
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/orders" className="rounded-[24px] border border-white/70 bg-white/88 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Package className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">{tOrder('title')}</h3>
          <p className="mt-1 text-sm text-text-secondary">{t('open_orders')}</p>
        </Link>

        <Link href="/wishlist" className="rounded-[24px] border border-white/70 bg-white/88 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">{tWishlist('title')}</h3>
          <p className="mt-1 text-sm text-text-secondary">{t('saved_items')}</p>
        </Link>

        <Link href="/support" className="rounded-[24px] border border-white/70 bg-white/88 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">{tSupport('title')}</h3>
          <p className="mt-1 text-sm text-text-secondary">{t('support_center')}</p>
        </Link>
      </section>

      <ModalShell
        open={activeModal === 'profile'}
        title={t('profile_modal_title')}
        subtitle={t('contact_details_hint')}
        onClose={() => setActiveModal(null)}
      >
        <StatusBanner feedback={profileFeedback} />
        <form onSubmit={handleProfileSubmit} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="modalFirstName" className="mb-1.5 block text-sm font-medium text-text-primary">
                {tAuth('first_name')}
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                <input
                  id="modalFirstName"
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="modalLastName" className="mb-1.5 block text-sm font-medium text-text-primary">
                {tAuth('last_name')}
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                <input
                  id="modalLastName"
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="modalEmail" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
              <input
                id="modalEmail"
                type="email"
                value={profile.email}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-gray-50 text-text-muted`}
              />
            </div>
            <p className="mt-1.5 text-xs text-text-muted">{t('email_read_only')}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <div>
              <label htmlFor="modalCountryCode" className="mb-1.5 block text-sm font-medium text-text-primary">
                {tAuth('code')}
              </label>
              <select
                id="modalCountryCode"
                value={profileForm.countryCode}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, countryCode: event.target.value }))
                }
                className={selectClass}
              >
                {countryCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modalPhoneNumber" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t('phone')}
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                <input
                  id="modalPhoneNumber"
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" loading={savingProfile} className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.18)]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" />
                {t('save_profile')}
              </span>
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setActiveModal(null)} className="rounded-xl">
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={activeModal === 'password'}
        title={t('password_modal_title')}
        subtitle={t('security_hint')}
        onClose={() => setActiveModal(null)}
      >
        <StatusBanner feedback={passwordFeedback} />
        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-5">
          <div>
            <label htmlFor="modalOldPassword" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('current_password')}
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
              <input
                id="modalOldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, oldPassword: event.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="modalPassword" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('new_password')}
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
              <input
                id="modalPassword"
                type="password"
                value={passwordForm.password}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, password: event.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="modalConfirmPassword" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('confirm_new_password')}
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
              <input
                id="modalConfirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" loading={savingPassword} className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.18)]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5" />
                {t('save_password')}
              </span>
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setActiveModal(null)} className="rounded-xl">
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={activeModal === 'address'}
        title={editingAddressId ? t('editing_address') : t('address_modal_title')}
        subtitle={t('addresses_hint')}
        onClose={() => setActiveModal(null)}
      >
        <StatusBanner feedback={addressFeedback} />
        <form onSubmit={handleAddressSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="modalStreet" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('street')}
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
              <input
                id="modalStreet"
                type="text"
                required
                value={addressForm.street}
                onChange={(event) =>
                  setAddressForm((current) => ({ ...current, street: event.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="modalCity" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t('city')}
              </label>
              <input
                id="modalCity"
                type="text"
                required
                value={addressForm.city}
                onChange={(event) =>
                  setAddressForm((current) => ({ ...current, city: event.target.value }))
                }
                className={selectClass}
              />
            </div>

            <div>
              <label htmlFor="modalState" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t('state')}
              </label>
              <input
                id="modalState"
                type="text"
                required
                value={addressForm.state}
                onChange={(event) =>
                  setAddressForm((current) => ({ ...current, state: event.target.value }))
                }
                className={selectClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="modalPostalCode" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t('postal_code')}
              </label>
              <input
                id="modalPostalCode"
                type="text"
                required
                value={addressForm.postalCode}
                onChange={(event) =>
                  setAddressForm((current) => ({ ...current, postalCode: event.target.value }))
                }
                className={selectClass}
                placeholder={t('postal_placeholder')}
              />
            </div>

            <div>
              <label htmlFor="modalCountry" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t('country')}
              </label>
              <input
                id="modalCountry"
                type="text"
                required
                value={addressForm.country}
                onChange={(event) =>
                  setAddressForm((current) => ({ ...current, country: event.target.value }))
                }
                className={selectClass}
                placeholder={t('country_placeholder')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="modalAddressType" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('address_type')}
            </label>
            <select
              id="modalAddressType"
              value={addressForm.addressType}
              onChange={(event) =>
                setAddressForm((current) => ({
                  ...current,
                  addressType: event.target.value as Address['addressType'],
                }))
              }
              className={selectClass}
            >
              <option value="home">{t('address_type_home')}</option>
              <option value="work">{t('address_type_work')}</option>
              <option value="billing">{t('address_type_billing')}</option>
              <option value="shipping">{t('address_type_shipping')}</option>
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white/85 px-4 py-3 text-sm font-medium text-text-primary">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(event) =>
                setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            {t('set_default')}
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={savingAddress} className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.18)]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" />
                {editingAddressId ? tCommon('save') : t('add_address')}
              </span>
            </Button>

            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)} className="rounded-xl">
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={Boolean(confirmDeleteAddress)}
        title={t('delete_address_title')}
        subtitle={t('delete_address_description')}
        onClose={() => setConfirmDeleteAddress(null)}
      >
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700">
          {confirmDeleteAddress ? `${confirmDeleteAddress.street}, ${confirmDeleteAddress.city}` : ''}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            loading={Boolean(confirmDeleteAddress && deletingAddressId === confirmDeleteAddress.id)}
            onClick={handleDeleteAddress}
            className="rounded-xl bg-red-600 shadow-[0_14px_34px_rgba(220,38,38,0.18)] hover:bg-red-700"
          >
            <span className="inline-flex items-center gap-2">
              <Trash2 className="h-4.5 w-4.5" />
              {t('delete_address_action')}
            </span>
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirmDeleteAddress(null)} className="rounded-xl">
            {tCommon('cancel')}
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}
