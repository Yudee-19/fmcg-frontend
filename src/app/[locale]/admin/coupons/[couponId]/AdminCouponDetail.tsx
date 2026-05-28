'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getCouponDetails,
  updateCoupon,
  deleteCoupon,
  type CouponDetailsResponse,
  type CouponStatus,
  type UpdateCouponPayload,
} from '@/services/couponService';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link, useRouter } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils';

const statusStyles: Record<CouponStatus, string> = {
  active:    'bg-green-100 text-green-800',
  disabled:  'bg-gray-100 text-gray-800',
  expired:   'bg-red-100 text-red-800',
  exhausted: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-blue-100 text-blue-800',
};

export default function AdminCouponDetail({ couponId }: { couponId: string }) {
  const router = useRouter();
  const [data, setData] = useState<CouponDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    discountPercentage: '',
    maxRedemptions: '',
    minCartAmount: '',
    maxCartAmount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getCouponDetails(couponId);
      setData(res);
      const c = res.coupon;
      setForm({
        discountPercentage: String(c.discountPercentage),
        maxRedemptions: String(c.maxRedemptions),
        minCartAmount: String(c.minCartAmount),
        maxCartAmount: c.maxCartAmount != null ? String(c.maxCartAmount) : '',
        startDate: c.startDate.slice(0, 10),
        endDate: c.endDate.slice(0, 10),
        isActive: c.isActive,
      });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponId]);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!data) return;
    setBusy(true);
    try {
      const payload: UpdateCouponPayload = {
        discountPercentage: parseFloat(form.discountPercentage),
        maxRedemptions: parseInt(form.maxRedemptions, 10),
        minCartAmount: parseFloat(form.minCartAmount || '0'),
        maxCartAmount: form.maxCartAmount ? parseFloat(form.maxCartAmount) : null,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate + 'T23:59:59').toISOString(),
        isActive: form.isActive,
      };
      await updateCoupon(couponId, payload);
      toast.success('Coupon updated');
      setEditing(false);
      await refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteCoupon(couponId);
      toast.success('Coupon deleted');
      router.push('/admin/coupons');
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Failed to delete');
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-8 text-center">
        <p className="text-sm text-red-600">Coupon not found</p>
        <Link
          href="/admin/coupons"
          className="text-xs font-semibold text-primary hover:underline mt-3 inline-block"
        >
          ← Back to coupons
        </Link>
      </div>
    );
  }

  const c = data.coupon;
  const s = data.redemptionStats;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-6 text-white shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs opacity-80">Coupon code</p>
            <p className="text-3xl font-mono font-bold tracking-wider">{c.code}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-white/20`}>
            {c.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/20 text-sm">
          <div>
            <p className="text-xs opacity-80">Discount</p>
            <p className="font-bold">{c.discountPercentage}%</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Used</p>
            <p className="font-bold">{c.currentRedemptions} / {c.maxRedemptions}</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Min cart</p>
            <p className="font-bold">{c.minCartAmount.toFixed(3)} KWD</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Max cart</p>
            <p className="font-bold">{c.maxCartAmount != null ? `${c.maxCartAmount.toFixed(3)} KWD` : '—'}</p>
          </div>
        </div>

        <p className="text-xs opacity-80 mt-4">
          Valid {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        {!editing ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              loading={busy}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => { setEditing(false); refresh(); }} disabled={busy}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loading={busy} disabled={busy}>
              Save changes
            </Button>
          </>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Edit coupon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Discount %</label>
              <input type="number" min="1" max="100" value={form.discountPercentage}
                onChange={(e) => set('discountPercentage', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Max redemptions</label>
              <input type="number" min="1" value={form.maxRedemptions}
                onChange={(e) => set('maxRedemptions', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min cart (KWD)</label>
              <input type="number" min="0" step="0.001" value={form.minCartAmount}
                onChange={(e) => set('minCartAmount', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Max cart (KWD) <span className="text-text-muted">— blank = no limit</span>
              </label>
              <input type="number" min="0" step="0.001" value={form.maxCartAmount}
                onChange={(e) => set('maxCartAmount', e.target.value)}
                placeholder="No limit"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Start date</label>
              <input type="date" value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">End date</label>
              <input type="date" value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="rounded border-border accent-primary" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
        </div>
      )}

      {/* Redemption stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Total redemptions" value={s.totalRedemptions} />
        <KpiCard label="Total discount given" value={`${s.totalDiscountGiven.toFixed(3)} KWD`} />
        <KpiCard label="Avg cart amount" value={`${s.averageCartAmount.toFixed(3)} KWD`} />
      </div>

      {/* Redemption history */}
      <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Redemption history</h3>
        </div>
        {data.redemptions.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No redemptions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 border-b border-border text-left">
                <tr>
                  <th className="px-4 py-2 font-semibold text-text-secondary">User</th>
                  <th className="px-4 py-2 font-semibold text-text-secondary">Order</th>
                  <th className="px-4 py-2 font-semibold text-text-secondary text-right">Cart total</th>
                  <th className="px-4 py-2 font-semibold text-text-secondary text-right">Discount</th>
                  <th className="px-4 py-2 font-semibold text-text-secondary">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <p className="text-sm text-text-primary">{r.user.username}</p>
                      <p className="text-xs text-text-muted">{r.user.email}</p>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{r.orderId}</td>
                    <td className="px-4 py-2 text-right">{r.cartAmountBeforeDiscount.toFixed(3)}</td>
                    <td className="px-4 py-2 text-right text-success font-medium">
                      −{r.discountAmount.toFixed(3)}
                    </td>
                    <td className="px-4 py-2 text-xs text-text-muted">{formatDate(r.redeemedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Link
        href="/admin/coupons"
        className="text-xs font-semibold text-primary hover:underline inline-block"
      >
        ← Back to coupons
      </Link>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-bold text-text-primary mt-1">{value}</p>
    </div>
  );
}
