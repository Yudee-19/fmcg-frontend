'use client';

import type { PaginationMeta } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationLinkProps {
  meta: PaginationMeta;
  className?: string;
}

export default function PaginationLink({
  meta,
  className,
}: PaginationLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = meta;

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  }

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
      {hasPrevPage ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm rounded-md border border-border text-text-secondary opacity-50 pointer-events-none">
          Previous
        </span>
      )}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md',
              page === currentPage
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:bg-gray-50'
            )}
          >
            {page}
          </Link>
        )
      )}
      {hasNextPage ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm rounded-md border border-border text-text-secondary opacity-50 pointer-events-none">
          Next
        </span>
      )}
    </nav>
  );
}
