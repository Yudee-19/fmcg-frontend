'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  hi: 'हिं',
  bn: 'বাং',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value });
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="bg-transparent text-white text-xs border-none cursor-pointer focus:outline-none"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc} className="text-text-primary">
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
