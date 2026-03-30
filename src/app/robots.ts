import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://crownvaluemart.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cart', '/profile', '/orders', '/checkout'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
