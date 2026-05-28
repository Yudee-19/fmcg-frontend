'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import {
  getCouponDashboard,
  listCoupons,
  createCoupon,
  type CouponDashboard,
  type CouponListItem,
  type CouponStatus,
  type CreateCouponPayload,
  type PaginationMeta,
} from '@/services/couponService';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';

const statusStyles: Record<CouponStatus, string> = {
  active:    'bg-green-100 text-green-800',
  disabled:  'bg-gray-100 text-gray-800',
  expired:   'bg-red-100 text-red-800',
  exhausted: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-blue-100 text-blue-800',
};

export default function AdminCouponsContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const [mounted, setMounted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => setMounted(true), []);

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
      <DashboardKpis />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">All coupons</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          + Create coupon
        </Button>
      </div>

      <CouponsList />

      {showCreate && (
        <CreateCouponModal
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

/* ─── KPI Dashboard ─── */

function DashboardKpis() {
  const [data, setData] = useState<CouponDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getCouponDashboard()
      .then((d) => alive && setData(d))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const cards = [
    { label: 'Total',      value: data.totalCoupons,      color: 'bg-blue-100 text-blue-700' },
    { label: 'Active',     value: data.activeCoupons,     color: 'bg-green-100 text-green-700' },
    { label: 'Expired',    value: data.expiredCoupons,    color: 'bg-red-100 text-red-700' },
    { label: 'Exhausted',  value: data.exhaustedCoupons,  color: 'bg-amber-100 text-amber-700' },
    { label: 'Redemptions', value: data.totalRedemptions, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value, color }) => (
        <div key={label} className="bg-bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-text-muted">{label}</p>
          <p className={`text-xl font-bold mt-1 inline-block px-2 py-0.5 rounded ${color}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── List ─── */

function CouponsList() {
  const [items, setItems] = useState<CouponListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CouponStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCoupons({
        page,
        limit: 20,
        status: status || undefined,
        search: search.trim() || undefined,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
          placeholder="Search by code…"
          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as CouponStatus | '');
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="expired">Expired</option>
          <option value="exhausted">Exhausted</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-gray-50 border-b border-border text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-secondary">Code</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-right">Discount</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-right">Usage</th>
              <th className="px-4 py-3 font-semibold text-text-secondary">Expires</th>
              <th className="px-4 py-3 font-semibold text-text-secondary">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-text-muted">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-text-muted">No coupons found</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-text-primary">{c.code}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{c.discountPercentage}%</td>
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {c.currentRedemptions} / {c.maxRedemptions}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(c.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold capitalize ${statusStyles[c.status] || 'bg-gray-100 text-gray-800'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/coupons/${c.id}`}
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

/* ─── Create Modal ─── */

function CreateCouponModal({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountPercentage: '20',
    maxRedemptions: '100',
    minCartAmount: '0',
    maxCartAmount: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: true,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const payload: CreateCouponPayload = {
        discountPercentage: parseFloat(form.discountPercentage),
        maxRedemptions: parseInt(form.maxRedemptions, 10),
        minCartAmount: parseFloat(form.minCartAmount || '0'),
        maxCartAmount: form.maxCartAmount ? parseFloat(form.maxCartAmount) : null,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate + 'T23:59:59').toISOString(),
        isActive: form.isActive,
      };
      if (form.code.trim()) payload.code = form.code.trim().toUpperCase();

      const created = await createCoupon(payload);
      toast.success(`Coupon ${created.code} created`);
      onClose();
      // Soft reload to refresh the list
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Failed to create');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-bg-card rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Create coupon</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Code (optional — leave blank to auto-generate)
            </label>
            <input
              type="text"
              maxLength={7}
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="7 chars [A-Z0-9]"
              className="w-full font-mono uppercase tracking-wider rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Discount %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.discountPercentage}
                onChange={(e) => set('discountPercentage', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Max redemptions</label>
              <input
                type="number"
                min="1"
                value={form.maxRedemptions}
                onChange={(e) => set('maxRedemptions', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min cart (KWD)</label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={form.minCartAmount}
                onChange={(e) => set('minCartAmount', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Max cart (KWD) <span className="text-text-muted">— optional</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={form.maxCartAmount}
                onChange={(e) => set('maxCartAmount', e.target.value)}
                placeholder="No limit"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Start date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">End date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="rounded border-border accent-primary"
            />
            <span className="text-sm text-text-primary">Active</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} loading={busy} disabled={busy}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
