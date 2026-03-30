'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { key: 'deals', href: '/deals' },
  { key: 'home', href: '/' },
  { key: 'shop', href: '/shop' },
  { key: 'new_arrivals', href: '/shop?sort=newest' },
  { key: 'best_sellers', href: '/shop?sort=popular' },
  { key: 'track_order', href: '/track-order' },
  { key: 'contact_us', href: '/support' },
] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('nav');

  return (
    <nav className="bg-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-10">
          {/* All Categories button */}
          <Link
            href="/shop"
            className="hidden lg:flex items-center gap-2 bg-primary-hover text-white text-sm font-medium px-4 h-full rounded-t-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {t('all_categories')}
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-white text-sm px-3 py-2 hover:bg-primary-hover rounded-md transition-colors"
              >
                {t(key)}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Mobile: show All Categories on the right */}
          <Link
            href="/shop"
            className="lg:hidden text-white text-sm font-medium"
          >
            {t('all_categories')}
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-2">
            {NAV_ITEMS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block text-white text-sm px-3 py-2 hover:bg-primary-hover rounded-md"
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
