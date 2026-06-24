/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: { unoptimized: true }
};

// Static export does not run Next.js middleware in production.
// Admin authorization is enforced by Supabase Auth + RLS inside client-gated admin modules.
// Hostinger response headers are generated into out/.htaccess by scripts/copy-hostinger-assets.mjs.
export default nextConfig;
