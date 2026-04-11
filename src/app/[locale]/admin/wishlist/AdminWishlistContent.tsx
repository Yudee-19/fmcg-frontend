'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Search, RefreshCw, Heart, Users, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import { formatDate, getLocalized } from '@/lib/utils';
import { getUserWishlist, getWishlistUsers } from '@/services/admin/wishlistService';
import { useAuthStore } from '@/store/authStore';
import type { AdminWishlistUserDto, PaginationMeta, Wishlist } from '@/types';

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

const recordsPerPageDefault = 20;

export default function AdminWishlistContent() {
  const t = useTranslations('admin_wishlist');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<AdminWishlistUserDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      setIsUsersLoading(false);
      return;
    }

    void loadUsers(1, searchQuery);
  }, [mounted, isAuthenticated, user?.role, searchQuery]);

  const summary = useMemo(
    () =>
      users.reduce(
        (accumulator, wishlistUser) => {
          accumulator.userCount += 1;
          accumulator.itemCount += wishlistUser.itemCount;
          accumulator.totalValue += wishlistUser.totalValue;
          return accumulator;
        },
        { userCount: 0, itemCount: 0, totalValue: 0 }
      ),
    [users]
  );

  async function loadUsers(page: number, search: string) {
    setIsUsersLoading(true);

    try {
      const response = await getWishlistUsers({
        page,
        limit: recordsPerPageDefault,
        search: search || undefined,
      });

      const nextUsers = response.data ?? [];
      setUsers(nextUsers);
      setPagination(response.pagination ?? null);
      setCurrentPage(page);
      setError('');

      const nextSelectedUserId =
        selectedUserId && nextUsers.some((wishlistUser) => wishlistUser.userId === selectedUserId)
          ? selectedUserId
          : nextUsers[0]?.userId ?? '';

      setSelectedUserId(nextSelectedUserId);

      if (nextSelectedUserId) {
        await loadUserWishlist(nextSelectedUserId);
      } else {
        setSelectedWishlist(null);
      }
    } catch (err: any) {
      const message = err?.message || t('load_users_failed');
      setUsers([]);
      setPagination(null);
      setSelectedUserId('');
      setSelectedWishlist(null);
      setError(message);
      toast.error(message);
    } finally {
      setIsUsersLoading(false);
      setIsRefreshing(false);
    }
  }

  async function loadUserWishlist(userId: string) {
    setIsWishlistLoading(true);

    try {
      const response = await getUserWishlist(userId);
      setSelectedWishlist(response.data ?? null);
      setSelectedUserId(userId);
    } catch (err: any) {
      setSelectedWishlist(null);
      toast.error(err?.message || t('load_wishlist_failed'));
    } finally {
      setIsWishlistLoading(false);
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  }

  function handleRefresh() {
    setIsRefreshing(true);
    void loadUsers(currentPage, searchQuery);
  }

  function handlePageChange(page: number) {
    if (page === currentPage || isUsersLoading || isWishlistLoading) {
      return;
    }

    void loadUsers(page, searchQuery);
  }

  if (!mounted) {
    return <Skeleton className="h-96 rounded-3xl" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">{t('login_required_title')}</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('login_required')}</p>
        <Link href="/auth/login" className="mt-6 inline-flex">
          <Button size="lg">{tCommon('login')}</Button>
        </Link>
      </div>
    );
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">{t('admin_only_title')}</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('admin_only')}</p>
        <Link href="/" className="mt-6 inline-flex">
          <Button variant="outline" size="lg">{t('back_home')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="grid flex-1 gap-3 lg:grid-cols-[minmax(0,1.6fr)_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('search_placeholder')}
                className={`${inputClass} pl-11`}
              />
            </div>
            <Button type="submit" size="lg" className="rounded-xl px-5">
              {t('search_action')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-xl px-5"
              onClick={handleClearSearch}
              disabled={!searchInput && !searchQuery}
            >
              {t('clear_action')}
            </Button>
          </form>

          <Button type="button" variant="outline" size="lg" className="rounded-xl px-5" onClick={handleRefresh}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </span>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{t('summary_users')}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{summary.userCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{t('summary_items')}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{summary.itemCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{t('summary_value')}</p>
            <PriceDisplay price={summary.totalValue} size="lg" className="mt-2 gap-0" />
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-[28px] border border-border bg-white p-4 shadow-sm">
          {isUsersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : null}

          {!isUsersLoading && users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-bg-card px-5 py-10 text-center text-sm text-text-secondary">
              {t('empty_users')}
            </div>
          ) : null}

          {!isUsersLoading && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((wishlistUser) => (
                <button
                  key={wishlistUser.userId}
                  type="button"
                  onClick={() => void loadUserWishlist(wishlistUser.userId)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedUserId === wishlistUser.userId
                      ? 'border-primary bg-primary-light/60 shadow-sm'
                      : 'border-border bg-white hover:bg-bg-card'
                  }`}
                >
                  <p className="text-sm font-semibold text-text-primary">{wishlistUser.userName || t('unknown_user')}</p>
                  <p className="mt-1 text-xs text-text-secondary">{wishlistUser.userEmail || '--'}</p>
                  <p className="mt-1 text-xs text-text-secondary">{wishlistUser.userPhone || t('not_provided')}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-border bg-bg-card px-3 py-1 font-medium text-text-primary">
                      {t('user_items_count', { count: wishlistUser.itemCount })}
                    </span>
                    <PriceDisplay price={wishlistUser.totalValue} size="sm" className="rounded-full border border-border bg-bg-card px-3 py-1" />
                  </div>
                  <p className="mt-2 text-[11px] text-text-muted">{t('updated_on_short', { date: formatDate(wishlistUser.lastUpdated) })}</p>
                </button>
              ))}
            </div>
          ) : null}

          {pagination ? (
            <div className="mt-5 border-t border-border pt-4">
              <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
          {isWishlistLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 rounded-2xl" />
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : null}

          {!isWishlistLoading && !selectedWishlist ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-card px-6 text-center">
              <Users className="h-8 w-8 text-primary" />
              <p className="mt-4 text-sm font-semibold text-text-primary">{t('select_user')}</p>
            </div>
          ) : null}

          {!isWishlistLoading && selectedWishlist ? (
            <>
              <div className="rounded-2xl border border-border bg-bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{t('user_details')}</p>
                <h2 className="mt-2 text-xl font-bold text-text-primary">{selectedWishlist.userDetails?.userName || t('unknown_user')}</h2>
                <p className="mt-1 text-sm text-text-secondary">{selectedWishlist.userDetails?.userEmail || '--'}</p>
                <p className="mt-1 text-sm text-text-secondary">{selectedWishlist.userDetails?.userPhone || t('not_provided')}</p>
                <p className="mt-3 text-xs text-text-muted">{t('updated_on', { date: formatDate(selectedWishlist.updatedAt) })}</p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-text-primary">{t('wishlist_items')}</h3>
                <span className="rounded-full border border-border bg-bg-card px-3 py-1 text-xs font-medium text-text-primary">
                  {t('items_count', { count: selectedWishlist.items.length })}
                </span>
              </div>

              {selectedWishlist.items.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-bg-card px-5 py-10 text-center text-sm text-text-secondary">
                  {t('empty_items')}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {selectedWishlist.items.map((item) => {
                    const itemTitle = getLocalized(item.title, locale) || t('untitled_product');
                    const itemImage = typeof item.thumbnail === 'string' ? item.thumbnail.trim() : '';

                    return (
                      <article key={`${item.productId}-${item.addedAt}`} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-card">
                          {itemImage ? (
                            <Image src={itemImage} alt={itemTitle} fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-primary">
                              <Heart className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-text-primary">{itemTitle}</p>
                          <p className="mt-1 text-xs text-text-secondary">{t('product_id', { id: item.productId || '--' })}</p>
                          <p className="mt-1 text-xs text-text-secondary">{t('added_on', { date: formatDate(item.addedAt) })}</p>
                        </div>

                        <PriceDisplay price={item.price} size="sm" className="gap-0" />
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}