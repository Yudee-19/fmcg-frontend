'use client';

import type { PaginationMeta } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  meta,
  onPageChange,
  className,
}: PaginationProps) {
  const t = useTranslations('common');
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = meta;

  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="px-3 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
      >
        {t('previous')}
      </button>
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md',
              page === currentPage
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:bg-gray-50'
            )}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="px-3 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
      >
        {t('next')}
      </button>
    </nav>
  );
}
