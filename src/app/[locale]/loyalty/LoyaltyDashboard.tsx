'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import {
  getMyHistory,
  type LoyaltyTransaction,
  type PaginationMeta,
} from '@/services/loyaltyService';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';

const typeStyleClasses: Record<string, { cls: string; sign: string; key: string }> = {
  earned:   { cls: 'bg-green-100 text-green-800', sign: '+', key: 'tx_earned' },
  redeemed: { cls: 'bg-red-100 text-red-800',     sign: '−', key: 'tx_redeemed' },
  refunded: { cls: 'bg-blue-100 text-blue-800',   sign: '+', key: 'tx_refunded' },
  adjusted: { cls: 'bg-gray-100 text-gray-800',   sign: '',  key: 'tx_adjusted' },
};

export default function LoyaltyDashboard() {
  const t = useTranslations('loyalty_page');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    rates,
    ratesLoaded,
    fetchRates,
    currentPoints,
    totalEarned,
    totalRedeemed,
    pointsLoaded,
    fetchMyPoints,
  } = useLoyaltyStore();

  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    fetchRates();
    if (isAuthenticated) fetchMyPoints();
  }, [isAuthenticated, fetchRates, fetchMyPoints]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    setHistoryLoading(true);
    getMyHistory(page, 10)
      .then((res) => {
        if (!alive) return;
        setHistory(res.items);
        setPagination(res.pagination);
        setHistoryError('');
      })
      .catch((e) => {
        if (alive) setHistoryError(e?.message || 'Failed to load history');
      })
      .finally(() => alive && setHistoryLoading(false));
    return () => {
      alive = false;
    };
  }, [isAuthenticated, page]);

  if (!isAuthenticated) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-text-secondary mb-6">{t('signin_required')}</p>
        <Link href="/auth/login">
          <Button size="lg">{t('signin_cta')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-6 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide opacity-80">{t('balance_label')}</p>
        {pointsLoaded ? (
          <p className="text-4xl font-bold mt-1">
            {currentPoints} <span className="text-lg font-medium opacity-80">{t('points_short')}</span>
          </p>
        ) : (
          <Skeleton className="h-10 w-32 mt-1 bg-white/20" />
        )}
        {rates && (
          <p className="text-xs opacity-80 mt-2">
            {t('worth', {
              kwd: ((currentPoints / rates.pointsRequired) * rates.redeemableKWD).toFixed(3),
            })}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <p className="text-xs opacity-80">{t('earned_label')}</p>
            <p className="text-lg font-semibold">{totalEarned}</p>
          </div>
          <div>
            <p className="text-xs opacity-80">{t('redeemed_label')}</p>
            <p className="text-lg font-semibold">{totalRedeemed}</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">{t('how_it_works')}</h2>
        {ratesLoaded && rates ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-success uppercase tracking-wide">{t('earn')}</p>
              <p className="text-sm text-text-primary mt-1">
                {t('earn_rule', { amount: rates.amountKWD, points: rates.pointsEarned })}
              </p>
              <p className="text-xs text-text-muted mt-1">{t('earned_when')}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t('redeem')}</p>
              <p className="text-sm text-text-primary mt-1">
                {t('redeem_rule', { points: rates.pointsRequired, amount: rates.redeemableKWD })}
              </p>
              <p className="text-xs text-text-muted mt-1">{t('redeem_when')}</p>
            </div>
          </div>
        ) : (
          <Skeleton className="h-24 w-full" />
        )}
      </div>

      {/* Transaction history */}
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{t('history')}</h2>
          {pagination && (
            <span className="text-xs text-text-muted">
              {t('total_count', { count: pagination.totalRecords })}
            </span>
          )}
        </div>

        {historyLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : historyError ? (
          <p className="text-sm text-red-600">{historyError}</p>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">{t('no_transactions')}</p>
            <p className="text-text-muted text-xs mt-1">{t('no_transactions_desc')}</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {history.map((tx, i) => {
                const style = typeStyleClasses[tx.type] || typeStyleClasses.adjusted;
                return (
                  <li key={i} className="py-3 flex items-start gap-3">
                    <span
                      className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-bold ${style.cls}`}
                    >
                      {t(style.key)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary line-clamp-1">
                        {tx.description}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDate(tx.createdAt)} • {t('balance_after')}: {tx.balanceAfter}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tx.type === 'redeemed' ? 'text-red-600' : 'text-success'
                      }`}
                    >
                      {style.sign}
                      {Math.abs(tx.points)}
                    </span>
                  </li>
                );
              })}
            </ul>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="text-xs font-semibold text-text-secondary hover:text-primary disabled:opacity-30"
                >
                  {t('previous')}
                </button>
                <span className="text-xs text-text-muted">
                  {t('page_of', { current: pagination.currentPage, total: pagination.totalPages })}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="text-xs font-semibold text-text-secondary hover:text-primary disabled:opacity-30"
                >
                  {t('next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAQ */}
      {rates && (
        <div className="bg-bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">{t('faq_title')}</h2>
          <ul className="space-y-3">
            <FaqItem q={t('faq_when_q')} a={t('faq_when_a')} />
            <FaqItem q={t('faq_products_q')} a={t('faq_products_a')} />
            <FaqItem q={t('faq_expire_q')} a={t('faq_expire_a')} />
            <FaqItem q={t('faq_cancel_q')} a={t('faq_cancel_a')} />
          </ul>
        </div>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <li>
      <p className="text-sm font-semibold text-text-primary">{q}</p>
      <p className="text-sm text-text-muted mt-1">{a}</p>
    </li>
  );
}
