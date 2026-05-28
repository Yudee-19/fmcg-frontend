'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import {
  applyLoyaltyDiscount,
  removeLoyaltyDiscount,
  pointsToKwd,
} from '@/services/loyaltyService';

interface Props {
  // From cart GET response — backend already calculates these for us
  currentBalance: number;
  maxPointsCanApply: number;
  appliedPoints: number;
  // Trigger a cart refresh after apply/remove
  onCartChange: () => void;
}

export function LoyaltyRedeemWidget({
  currentBalance,
  maxPointsCanApply,
  appliedPoints,
  onCartChange,
}: Props) {
  const t = useTranslations('loyalty_widget');
  const { rates, ratesLoaded, fetchRates, setCurrentPoints } = useLoyaltyStore();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ratesLoaded) fetchRates();
  }, [ratesLoaded, fetchRates]);

  if (!rates) return null;

  // Effective ceiling = min(what cart accepts, what user has)
  const usableMax = Math.min(maxPointsCanApply, currentBalance);
  const canRedeem = usableMax >= rates.pointsRequired;

  // ─── Preset chips: meaningful options based on balance ───
  // Build chunks at pointsRequired, capped at usableMax.
  // E.g. min=100, usableMax=545 → [100, 200, 500, 545]
  const presets: number[] = (() => {
    if (!canRedeem) return [];
    const out: number[] = [];
    const step = rates.pointsRequired;
    const maxChunks = Math.floor(usableMax / step);

    // Up to 3 "round" suggestions: 1x, 2x, 5x, 10x — only those ≤ maxChunks
    [1, 2, 5, 10].forEach((mult) => {
      if (mult <= maxChunks) out.push(mult * step);
    });

    // Always include the absolute max as the final chip if different from last
    const maxRedeemable = maxChunks * step;
    if (maxRedeemable && !out.includes(maxRedeemable)) {
      out.push(maxRedeemable);
    }
    return Array.from(new Set(out)).sort((a, b) => a - b);
  })();

  const parsedInput = parseInt(input || '0', 10) || 0;
  const inputKwd = pointsToKwd(parsedInput, rates);

  const apply = async (points: number) => {
    setError('');
    setBusy(true);
    try {
      await applyLoyaltyDiscount(points);
      setCurrentPoints(currentBalance - points);
      setInput('');
      onCartChange();
      toast.success(
        t('applied_title', { points }) +
          ' — ' +
          t('applied_subtitle', { kwd: pointsToKwd(points, rates).toFixed(3) }),
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message || e?.message || 'Failed to apply';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setError('');
    setBusy(true);
    try {
      await removeLoyaltyDiscount();
      setCurrentPoints(currentBalance + appliedPoints);
      onCartChange();
      toast.success(t('remove'));
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message || e?.message || 'Failed to remove';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleInputApply = () => {
    if (parsedInput < rates.pointsRequired) {
      setError(t('min_error', { min: rates.pointsRequired }));
      return;
    }
    if (parsedInput > usableMax) {
      setError(t('max_error', { max: usableMax }));
      return;
    }
    void apply(parsedInput);
  };

  if (appliedPoints > 0) {
    return (
      <div className="bg-success/5 border border-success/30 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl">👑</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {t('applied_title', { points: appliedPoints })}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {t('applied_subtitle', {
              kwd: pointsToKwd(appliedPoints, rates).toFixed(3),
            })}
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {busy ? '…' : t('remove')}
        </button>
      </div>
    );
  }

  if (!canRedeem) {
    const isLargerCart =
      maxPointsCanApply < rates.pointsRequired &&
      currentBalance >= rates.pointsRequired;
    return (
      <div className="bg-bg-card border border-border rounded-2xl p-4">
        <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <span>👑</span> {t('use_points')}
        </p>
        <p className="text-xs text-text-muted mt-1">
          {isLargerCart
            ? t('min_required_larger', {
                balance: currentBalance,
                min: rates.pointsRequired,
              })
            : t('min_required', {
                balance: currentBalance,
                min: rates.pointsRequired,
              })}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2"
      >
        <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <span>👑</span> {t('use_points')}
        </span>
        <span className="text-xs text-text-muted">
          {t('balance')}: <b>{currentBalance}</b> {t('points_short')}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-text-muted">
            {t('rate_summary', {
              required: rates.pointsRequired,
              kwd: rates.redeemableKWD,
              max: usableMax,
            })}
          </p>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => apply(p)}
                disabled={busy}
                className="px-3 py-1.5 rounded-full border border-border bg-white text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                {t('conversion', {
                  points: p,
                  kwd: pointsToKwd(p, rates).toFixed(3),
                })}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min={rates.pointsRequired}
              max={usableMax}
              step={rates.pointsRequired}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              placeholder={t('min_placeholder', { min: rates.pointsRequired })}
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleInputApply}
              disabled={busy || !parsedInput}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50"
            >
              {t('apply')}
            </button>
          </div>

          {parsedInput >= rates.pointsRequired && (
            <p className="text-xs text-text-secondary">
              {t('conversion', { points: parsedInput, kwd: inputKwd.toFixed(3) })}
            </p>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
