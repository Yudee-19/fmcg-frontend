'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import {
  getAdminConfig,
  updateAdminConfig,
  getAdminDashboard,
  getAdminLeaderboard,
  type AdminConfigResponse,
  type AdminDashboard,
  type LeaderboardEntry,
  type PaginationMeta,
} from '@/services/loyaltyService';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';

type Tab = 'dashboard' | 'config';

export default function AdminLoyaltyContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Wait for client mount to avoid SSR/persisted-state hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !userRole || userRole === 'USER') {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-text-secondary">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {(['dashboard', 'config'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <DashboardTab />
          <div className="pt-2">
            <h2 className="text-base font-semibold text-text-primary mb-3">
              Leaderboard
            </h2>
            <LeaderboardTab />
          </div>
        </>
      )}
      {activeTab === 'config' && <ConfigTab />}
    </div>
  );
}

/* ─── Dashboard tab ───────────────────────────────────────────────────────── */

function DashboardTab() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminDashboard()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e?.message || 'Failed to load'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }
  if (error || !data) {
    return <p className="text-sm text-red-600">{error || 'No data'}</p>;
  }

  const stats = [
    { label: 'Total Issued',     value: data.systemStats.totalPointsIssued,        color: 'bg-success/10 text-success' },
    { label: 'Total Redeemed',   value: data.systemStats.totalPointsRedeemed,      color: 'bg-red-100 text-red-700' },
    { label: 'Outstanding',      value: data.systemStats.totalPointsOutstanding,   color: 'bg-amber-100 text-amber-700' },
    { label: 'Customers',        value: data.systemStats.totalCustomersWithPoints, color: 'bg-blue-100 text-blue-700' },
    { label: 'Avg / Customer',   value: data.systemStats.avgPointsPerCustomer,     color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Current rates */}
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Current rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-semibold text-success uppercase tracking-wide">Earning</p>
            <p className="text-sm text-text-primary mt-1">{data.configuration.earning}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Redemption</p>
            <p className="text-sm text-text-primary mt-1">{data.configuration.redemption}</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-text-muted">{label}</p>
            <p className={`text-xl font-bold mt-1 inline-block px-2 py-0.5 rounded ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Leaderboard tab ─────────────────────────────────────────────────────── */

function LeaderboardTab() {
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminLeaderboard(page, 10)
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setPagination(res.pagination);
      })
      .catch((e) => alive && setError(e?.message || 'Failed to load'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page]);

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-gray-50 border-b border-border text-left">
          <tr>
            <th className="px-4 py-3 font-semibold text-text-secondary w-12">#</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">User</th>
            <th className="px-4 py-3 font-semibold text-text-secondary text-right">Current</th>
            <th className="px-4 py-3 font-semibold text-text-secondary text-right">Earned</th>
            <th className="px-4 py-3 font-semibold text-text-secondary text-right">Redeemed</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-text-muted py-8">
                No customers with points yet
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr key={row.userId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-text-primary">{row.rank}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-text-primary truncate max-w-[260px]">
                    {row.name || row.username || 'Unknown'}
                  </p>
                  {row.email && (
                    <p className="text-xs text-text-muted truncate max-w-[260px]">{row.email}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-primary">{row.currentPoints}</td>
                <td className="px-4 py-3 text-right text-success">{row.totalEarned}</td>
                <td className="px-4 py-3 text-right text-red-600">{row.totalRedeemed}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/loyalty/customer/${row.userId}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
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
  );
}

/* ─── Config tab ──────────────────────────────────────────────────────────── */

function ConfigTab() {
  const [config, setConfig] = useState<AdminConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [earnAmount, setEarnAmount] = useState('100');
  const [earnPoints, setEarnPoints] = useState('10');
  const [redeemPoints, setRedeemPoints] = useState('100');
  const [redeemKwd, setRedeemKwd] = useState('1');

  useEffect(() => {
    let alive = true;
    getAdminConfig()
      .then((c) => {
        if (!alive) return;
        setConfig(c);
        setEarnAmount(String(c.earning.amountKWD));
        setEarnPoints(String(c.earning.pointsEarned));
        setRedeemPoints(String(c.redemption.pointsRequired));
        setRedeemKwd(String(c.redemption.redeemableKWD));
      })
      .catch((e) => alive && setError(e?.message || 'Failed to load config'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const updated = await updateAdminConfig({
        earning: {
          amountKWD: parseFloat(earnAmount),
          pointsEarned: parseFloat(earnPoints),
        },
        redemption: {
          pointsRequired: parseFloat(redeemPoints),
          redeemableKWD: parseFloat(redeemKwd),
        },
      });
      setConfig(updated);
      setSuccess('Config updated successfully');
      toast.success('Config updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message || e?.message || 'Failed to update';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-72 w-full rounded-xl" />;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6 space-y-6 max-w-2xl">
      {/* Earning section */}
      <div>
        <h3 className="text-sm font-semibold text-success uppercase tracking-wide mb-3">
          Earning rate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Spend amount (KWD)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={earnAmount}
              onChange={(e) => setEarnAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Points awarded
            </label>
            <input
              type="number"
              min="0"
              value={earnPoints}
              onChange={(e) => setEarnPoints(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Customers earn <b>{earnPoints || 0}</b> points for every{' '}
          <b>{earnAmount || 0} KWD</b> spent. Earned only after order delivery.
        </p>
      </div>

      {/* Redemption section */}
      <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
          Redemption rate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Points required
            </label>
            <input
              type="number"
              min="1"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Discount (KWD)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={redeemKwd}
              onChange={(e) => setRedeemKwd(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2">
          <b>{redeemPoints || 0}</b> points = <b>{redeemKwd || 0} KWD</b> discount at checkout.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-success/10 border border-success/30 px-3 py-2 text-sm text-success">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-text-muted">
          Last updated:{' '}
          {config?.updatedAt ? new Date(config.updatedAt).toLocaleString() : '—'}
        </p>
        <Button onClick={handleSave} loading={saving} disabled={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
