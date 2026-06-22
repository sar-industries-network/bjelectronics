import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BJ ELECTRONICS',
    short_name: 'BJ Electronics',
    description: 'Premium online electronics store in Bangladesh.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }
    ],
  };
}
