'use client';

import { useEffect, useState } from 'react';
import {
  getAdminCustomerDetails,
  type CustomerLoyaltyDetails,
  type LoyaltyTransaction,
  type PaginationMeta,
} from '@/services/loyaltyService';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils';

const typeStyles: Record<string, { label: string; cls: string; sign: string }> = {
  earned:   { label: 'Earned',   cls: 'bg-green-100 text-green-800',  sign: '+' },
  redeemed: { label: 'Redeemed', cls: 'bg-red-100 text-red-800',      sign: '−' },
  refunded: { label: 'Refunded', cls: 'bg-blue-100 text-blue-800',    sign: '+' },
  adjusted: { label: 'Adjusted', cls: 'bg-gray-100 text-gray-800',    sign: '' },
};

export default function AdminCustomerLoyalty({ userId }: { userId: string }) {
  const [details, setDetails] = useState<CustomerLoyaltyDetails | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminCustomerDetails(userId, page, 10)
      .then((res) => {
        if (!alive) return;
        setDetails(res.details);
        setPagination(res.pagination);
      })
      .catch((e) => alive && setError(e?.message || 'Failed to load customer details'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [userId, page]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-8 text-center">
        <p className="text-red-600 text-sm">{error || 'Customer not found'}</p>
        <Link
          href="/admin/loyalty"
          className="text-xs font-semibold text-primary hover:underline mt-3 inline-block"
        >
          ← Back to leaderboard
        </Link>
      </div>
    );
  }

  const w = details.wallet;

  return (
    <div className="space-y-6">
      {/* Wallet overview */}
      <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-6 text-white shadow-sm">
        <p className="text-xs opacity-80">Customer</p>
        <p className="text-lg font-semibold">{w.name || w.username || 'Unknown'}</p>
        {w.email && <p className="text-xs opacity-90">{w.email}</p>}
        <p className="font-mono text-[10px] opacity-60 mt-1 break-all">ID: {w.userId}</p>

        <p className="text-4xl font-bold mt-4">
          {w.currentPoints}{' '}
          <span className="text-base font-medium opacity-80">current points</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <p className="text-xs opacity-80">Total earned</p>
            <p className="text-lg font-semibold">{w.totalEarnedPoints}</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Total redeemed</p>
            <p className="text-lg font-semibold">{w.totalRedeemedPoints}</p>
          </div>
        </div>
        <p className="text-xs opacity-80 mt-3">
          Last activity: {new Date(w.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Transactions */}
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Transactions</h2>
          {pagination && (
            <span className="text-xs text-text-muted">
              {pagination.totalRecords} total
            </span>
          )}
        </div>

        {details.transactions.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">No transactions</p>
        ) : (
          <ul className="divide-y divide-border">
            {details.transactions.map((tx: LoyaltyTransaction, i) => {
              const s = typeStyles[tx.type] || typeStyles.adjusted;
              return (
                <li key={i} className="py-3 flex items-start gap-3">
                  <span
                    className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-bold ${s.cls}`}
                  >
                    {s.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary line-clamp-1">
                      {tx.description}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatDate(tx.createdAt)} • Balance: {tx.balanceAfter}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.type === 'redeemed' ? 'text-red-600' : 'text-success'
                    }`}
                  >
                    {s.sign}
                    {Math.abs(tx.points)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className="text-xs font-semibold text-text-secondary disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-xs text-text-muted">
              Page {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              className="text-xs font-semibold text-text-secondary disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <Link
        href="/admin/loyalty"
        className="text-xs font-semibold text-primary hover:underline inline-block"
      >
        ← Back to leaderboard
      </Link>
    </div>
  );
}
