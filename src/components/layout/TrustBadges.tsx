import { getTranslations } from 'next-intl/server';

const BADGE_ICONS = [
  // Truck icon
  <svg key="delivery" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  // Shield icon
  <svg key="payment" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  // Refresh icon
  <svg key="returns" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  // Tag icon
  <svg key="deals" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
];

const BADGE_KEYS = [
  { title: 'fast_delivery', desc: 'fast_delivery_desc' },
  { title: 'secure_payment', desc: 'secure_payment_desc' },
  { title: 'easy_returns', desc: 'easy_returns_desc' },
  { title: 'best_deals', desc: 'best_deals_desc' },
] as const;

export default async function TrustBadges() {
  const t = await getTranslations('trust');

  return (
    <section className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {BADGE_KEYS.map(({ title, desc }, i) => (
            <div key={title} className="flex flex-col items-center text-center gap-2">
              <div className="text-primary">{BADGE_ICONS[i]}</div>
              <h3 className="font-semibold text-sm text-text-primary">
                {t(title)}
              </h3>
              <p className="text-xs text-text-secondary">{t(desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
