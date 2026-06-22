import type { Metadata, Viewport } from 'next';
import { GlobalRealtimeClient } from '@/components/global-realtime-client';
import './globals.css';
import './product-detail.css';
import './product-detail-plus.css';
import './live-sync.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bjelectronics.shop'),
  title: 'BJ ELECTRONICS | Bangladesh Electronics Store',
  description: 'Premium online electronics store and admin dashboard for Bangladesh customers.',
  icons: { icon: '/favicon.svg' }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-[#07111f]">
        <GlobalRealtimeClient />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
