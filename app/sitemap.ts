import type { MetadataRoute } from 'next';
import { seedProducts, seedCategories } from '@/lib/demo-data';

const baseUrl = 'https://bjelectronics.shop';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/products', '/cart', '/checkout', '/wishlist', '/track-order', '/account', '/help-center', '/shipping-delivery', '/returns-refunds', '/warranty-policy', '/privacy-policy', '/terms'];
  return [
    ...staticPages.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.7 })),
    ...seedProducts.map((product) => ({ url: `${baseUrl}/product/${product.slug}/`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...seedCategories.map((category) => ({ url: `${baseUrl}/categories/${category.slug}/`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
