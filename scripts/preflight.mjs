import fs from 'node:fs';
import process from 'node:process';

const requiredFiles = [
  'next.config.mjs',
  'tailwind.config.ts',
  'postcss.config.js',
  'app/globals.css',
  'app/ui-polish.css',
  'app/design-system.css',
  'app/responsive-system.css',
  'app/store-template-polish.css',
  'app/pro-ui-kit.css',
  'app/admin-dashboard-plus.css',
  'app/help/page.tsx',
  'app/roadmap/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/support/page.tsx',
  'components/storefront-app.tsx',
  'components/support-center-client.tsx',
  'components/admin-dashboard-plus.tsx',
  'components/admin-shell.tsx',
  'components/admin-orders-manager.tsx',
  'components/admin-settings-manager.tsx',
  'components/pro-product-detail-live.tsx',
  'components/pro-ui-kit.tsx',
  'components/pro-ui-showcase.tsx',
  'components/roadmap-page.tsx',
  'components/feature-center.tsx',
  'app/admin/ui-kit/page.tsx',
  'app/order-success/[orderNo]/page.tsx',
  'lib/client-security.ts',
  'lib/feature-registry.ts',
  'lib/supabaseClient.ts',
  'scripts/env-check.mjs',
  'scripts/secret-scan.mjs',
  'scripts/lock-consistency.mjs',
  'scripts/css-audit.mjs',
  'scripts/dead-import-scan.mjs',
  'scripts/build-audit.mjs',
  'scripts/functional-smoke.mjs',
  'scripts/build-health-report.mjs',
  'scripts/hostinger-zip.mjs',
  'scripts/route-smoke-test.mjs',
];

const forbiddenFiles = [
  'middleware.ts',
  'components/enterprise-app.tsx',
  'app/order-success/[orderNumber]/page.tsx',
  'app/product-detail.css',
  'app/product-detail-plus.css',
  'app/product-detail-fixes.css',
  'components/admin-dashboard-pro.tsx',
  'components/command-center-client.tsx'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Preflight failed. Missing required files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const legacy = forbiddenFiles.filter((file) => fs.existsSync(file));
if (legacy.length) {
  console.error('Preflight failed. Legacy duplicate/dead files still exist:');
  for (const file of legacy) console.error(`- ${file}`);
  process.exit(1);
}

const orderSuccessRoutes = fs.readdirSync('app/order-success', { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^\[.+\]$/.test(entry.name));
if (orderSuccessRoutes.length !== 1 || orderSuccessRoutes[0].name !== '[orderNo]') {
  console.error('Preflight failed. Only app/order-success/[orderNo] is allowed to avoid ambiguous dynamic routes.');
  process.exit(1);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) {
  console.error(`Preflight failed. Node 20+ required, current Node is ${process.versions.node}.`);
  process.exit(1);
}

const uiPolish = fs.readFileSync('app/ui-polish.css', 'utf8');
for (const requiredImport of ['./design-system.css', './pro-ui-kit.css', './admin-dashboard-plus.css', './responsive-system.css', './product-detail-minimal.css', './store-template-polish.css']) {
  if (!uiPolish.includes(requiredImport)) {
    console.error(`Preflight failed. app/ui-polish.css is missing ${requiredImport}.`);
    process.exit(1);
  }
}

console.log('Production preflight passed.');
