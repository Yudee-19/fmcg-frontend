'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import { calcPointsToEarn } from '@/services/loyaltyService';

interface Props {
  cartAmount?: number;
  variant?: 'default' | 'compact';
}

export function EarnHint({ cartAmount, variant = 'default' }: Props) {
  const t = useTranslations('loyalty_hint');
  const { rates, ratesLoaded, fetchRates } = useLoyaltyStore();

  useEffect(() => {
    if (!ratesLoaded) fetchRates();
  }, [ratesLoaded, fetchRates]);

  if (!rates) return null;

  let body: React.ReactNode;
  if (cartAmount == null) {
    body = t.rich('generic', {
      points: rates.pointsEarned,
      amount: rates.amountKWD,
      b: (chunks) => <b>{chunks}</b>,
    });
  } else if (cartAmount < rates.amountKWD) {
    body = t.rich('below_threshold', {
      kwd: (rates.amountKWD - cartAmount).toFixed(3),
      b: (chunks) => <b>{chunks}</b>,
    });
  } else {
    const pts = calcPointsToEarn(cartAmount, rates);
    body = t.rich(pts === 1 ? 'above_threshold_one' : 'above_threshold', {
      points: pts,
      b: (chunks) => <b>{chunks}</b>,
    });
  }

  if (variant === 'compact') {
    return (
      <p className="text-xs text-text-muted flex items-center gap-1">
        <span aria-hidden>👑</span>
        {body}
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-primary-light/40 border border-primary-light rounded-xl px-3 py-2.5">
      <span aria-hidden className="text-base mt-0.5">👑</span>
      <p className="text-sm text-text-secondary">{body}</p>
    </div>
  );
}
