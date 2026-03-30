'use client';

import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'sm',
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center border border-border rounded-md',
        className
      )}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center text-text-secondary hover:bg-gray-100 disabled:opacity-40 transition-colors',
          size === 'sm' ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-base'
        )}
      >
        −
      </button>
      <span
        className={cn(
          'flex items-center justify-center font-medium text-text-primary border-x border-border',
          size === 'sm' ? 'w-8 h-7 text-sm' : 'w-10 h-9 text-base'
        )}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center text-text-secondary hover:bg-gray-100 disabled:opacity-40 transition-colors',
          size === 'sm' ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-base'
        )}
      >
        +
      </button>
    </div>
  );
}
