import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function Footer() {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');

  return (
    <footer className="bg-footer-bg text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-white font-bold text-xl">Crown</span>
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020.01 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              <span className="text-xs opacity-80">Value Mart</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              {t('tagline')}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
              {['facebook', 'instagram', 'youtube', 'twitter'].map((social) => (
                <span
                  key={social}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <span className="text-xs capitalize">{social[0].toUpperCase()}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">{t('quick_links')}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/shop" className="hover:underline">{tn('shop')}</Link></li>
              <li><Link href="/deals" className="hover:underline">{tn('deals')}</Link></li>
              <li><Link href="/shop?sort=newest" className="hover:underline">{tn('new_arrivals')}</Link></li>
              <li><Link href="/support" className="hover:underline">{tn('contact_us')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">{t('categories')}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/category/fruits-vegetables" className="hover:underline">{t('fruits_vegetables')}</Link></li>
              <li><Link href="/category/dairy-bakery" className="hover:underline">{t('dairy_bakery')}</Link></li>
              <li><Link href="/category/snacks" className="hover:underline">{t('snacks')}</Link></li>
              <li><Link href="/category/household" className="hover:underline">{t('household')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-3">{t('contact_info')}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>{t('website')}</li>
              <li>{t('phone')}</li>
              <li>{t('location')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-80">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">{t('terms')}</Link>
            <Link href="/privacy" className="hover:underline">{t('privacy')}</Link>
            <Link href="/cookies" className="hover:underline">{t('cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
