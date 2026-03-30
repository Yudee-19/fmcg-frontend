import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getCategories } from '@/lib/api';

const CATEGORY_ICONS: Record<string, string> = {
  groceries: '🛒',
  electronics: '📱',
  furniture: '🪑',
  beauty: '💄',
  fragrances: '🌸',
  'skin-care': '🧴',
  'home-decoration': '🏠',
  'kitchen-accessories': '🍳',
  laptops: '💻',
  'mens-shirts': '👔',
  'mens-shoes': '👞',
  'mens-watches': '⌚',
  'mobile-accessories': '🔌',
  motorcycle: '🏍️',
  sports: '⚽',
  sunglasses: '🕶️',
  tablets: '📱',
  tops: '👚',
  vehicle: '🚗',
  'womens-bags': '👜',
  'womens-dresses': '👗',
  'womens-jewellery': '💍',
  'womens-shoes': '👠',
  'womens-watches': '⌚',
};

export default async function CategoryStrip() {
  const t = await getTranslations('home');

  let categories: string[] = [] as string[];
  try {
    const res = await getCategories();
    categories = res.data?.slice(0, 8) ?? [];
  } catch {
    categories = [];
  }

  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        {t('shop_by_category')}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/category/${encodeURIComponent(cat)}`}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-2xl group-hover:bg-primary/10 transition-colors">
              {CATEGORY_ICONS[cat.toLowerCase()] ?? '📦'}
            </div>
            <span className="text-xs text-text-secondary font-medium text-center capitalize max-w-[72px] truncate">
              {cat.replace(/-/g, ' ')}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
