'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';
import { Link } from '@/i18n/navigation';

export default function AnnouncementBar() {
  const t = useTranslations('announcement');
  const tc = useTranslations('common');

  return (
    <div className="bg-primary text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5">
          <span>{t('text')}</span>
          <span className="hidden sm:inline">—</span>
          <Link
            href="/shop"
            className="hidden sm:inline font-semibold underline hover:no-underline"
          >
            {t('cta')}
          </Link>
        </p>
        <div className="hidden md:flex items-center gap-3 text-xs">
          <LanguageSwitcher />
          <span className="opacity-50">|</span>
          <CurrencySwitcher />
          <span className="opacity-50">|</span>
          <Link href="/support" className="hover:underline">
            {tc('customer_service')}
          </Link>
        </div>
      </div>
    </div>
  );
}
