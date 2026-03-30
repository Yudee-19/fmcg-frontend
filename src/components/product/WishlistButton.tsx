'use client';

import { useState, useEffect } from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: {
    productId: string;
    title: string;
    price: number;
    thumbnail: string;
  };
  className?: string;
}

export default function WishlistButton({
  product,
  className,
}: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);

  useEffect(() => setMounted(true), []);

  const active = mounted && isWishlisted(product.productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={cn(
        'p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors',
        className
      )}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={cn('w-4 h-4', active ? 'text-primary fill-primary' : 'text-text-muted')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
