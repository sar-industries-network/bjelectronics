import type { Metadata, Viewport } from 'next';
import { GlobalRealtimeClient } from '@/components/global-realtime-client';
import { GlobalUIShell } from '@/components/global-ui-shell';
import './globals.css';
import './ui-polish.css';
import './live-sync.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bjelectronics.shop'),
  applicationName: 'BJ ELECTRONICS',
  title: 'BJ ELECTRONICS | Bangladesh Electronics Store',
  description: 'Premium online electronics store and admin dashboard for Bangladesh customers.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/favicon.svg' },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'BJ ELECTRONICS',
    statusBarStyle: 'default'
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#07111f' }
  ],
  colorScheme: 'light dark'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-[#07111f]">
        <GlobalRealtimeClient />
        <GlobalUIShell />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
