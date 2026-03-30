import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: 'discount' | 'new' | 'status';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full',
        variant === 'discount' &&
          'bg-primary text-white text-[11px] px-2 py-0.5',
        variant === 'new' && 'bg-teal-500 text-white text-[11px] px-2 py-0.5',
        variant === 'status' &&
          'bg-gray-100 text-text-secondary text-xs px-2.5 py-1',
        className
      )}
    >
      {children}
    </span>
  );
}
