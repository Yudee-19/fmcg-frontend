import Link from 'next/link';

const PROMOS = [
  {
    title: 'Fresh Groceries',
    subtitle: 'Up to 40% off on daily essentials',
    bg: 'bg-orange-50',
    textColor: 'text-orange-800',
    href: '/category/groceries',
  },
  {
    title: 'Brand Shopping',
    subtitle: 'Top brands at unbeatable prices',
    bg: 'bg-blue-50',
    textColor: 'text-blue-800',
    href: '/shop',
  },
  {
    title: 'Competitive Pricing',
    subtitle: 'Best value on every purchase',
    bg: 'bg-green-50',
    textColor: 'text-green-800',
    href: '/deals',
  },
];

export default function PromoCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PROMOS.map((promo) => (
        <Link
          key={promo.title}
          href={promo.href}
          className={`${promo.bg} rounded-xl p-6 hover:shadow-md transition-shadow`}
        >
          <h3 className={`text-lg font-semibold ${promo.textColor}`}>
            {promo.title}
          </h3>
          <p className="text-sm text-text-secondary mt-1">{promo.subtitle}</p>
        </Link>
      ))}
    </section>
  );
}
