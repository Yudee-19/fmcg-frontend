import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function HeroBanner() {
  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  return (
    <section className="bg-white rounded-xl overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 py-8 md:py-12">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
              {t('hero_title').split('Before')[0]}
              <span className="text-primary">Before</span>
            </h1>
            <p className="mt-4 text-text-secondary text-base md:text-lg max-w-lg">
              {t('hero_subtitle')}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
              >
                {t('explore')}
              </Link>
              <Link
                href="/deals"
                className="inline-flex items-center justify-center border-2 border-primary text-primary font-medium px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
              >
                {tc('shop_now')}
              </Link>
            </div>
          </div>
          {/* Illustration placeholder */}
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-primary-light rounded-full flex items-center justify-center">
              <svg
                className="w-32 h-32 text-primary opacity-30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020.01 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
