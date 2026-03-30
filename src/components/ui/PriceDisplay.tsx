'use client';

import { useState, useEffect } from 'react';
import { usePreferenceStore } from '@/store/preferenceStore';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({
  price,
  originalPrice,
  className,
  size = 'md',
}: PriceDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const formatPrice = usePreferenceStore((s) => s.formatPrice);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span
          className={cn(
            'bg-gray-200 animate-pulse rounded',
            size === 'sm' && 'h-4 w-14',
            size === 'md' && 'h-5 w-16',
            size === 'lg' && 'h-7 w-24'
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span
        className={cn(
          'font-bold text-primary',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-2xl'
        )}
      >
        {formatPrice(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span
          className={cn(
            'text-text-muted line-through',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}
