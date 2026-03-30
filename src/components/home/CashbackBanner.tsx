import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function CashbackBanner() {
  const t = await getTranslations('home');

  return (
    <section className="bg-orange-50 rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            {t('cashback_title')}
          </h2>
          <Link
            href="/shop"
            className="inline-block mt-4 bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
          >
            {t('cashback_cta')}
          </Link>
        </div>
        <div className="mt-6 md:mt-0">
          <div className="w-40 h-40 bg-primary-light rounded-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-primary opacity-40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
