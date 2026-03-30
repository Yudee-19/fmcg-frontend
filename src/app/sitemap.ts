import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/api';
import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://crownvaluemart.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = [];

  try {
    const { data: products } = await getProducts({ limit: 1000 });
    productUrls = products.flatMap((p: any) =>
      routing.locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/products/${p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );
  } catch {
    // Products unavailable - generate static pages only
  }

  const staticUrls: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) => [
      {
        url: `${SITE_URL}/${locale}`,
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/${locale}/shop`,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/${locale}/deals`,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ]
  );

  return [...staticUrls, ...productUrls];
}
