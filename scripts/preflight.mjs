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
  'components/storefront-app.tsx',
  'components/admin-shell.tsx',
  'components/admin-orders-manager.tsx',
  'components/admin-settings-manager.tsx',
  'components/pro-product-detail-live.tsx',
  'lib/supabaseClient.ts',
  'scripts/route-smoke-test.mjs',
];

const forbiddenFiles = [
  'components/enterprise-app.tsx',
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

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) {
  console.error(`Preflight failed. Node 20+ required, current Node is ${process.versions.node}.`);
  process.exit(1);
}

const uiPolish = fs.readFileSync('app/ui-polish.css', 'utf8');
for (const requiredImport of ['./design-system.css', './responsive-system.css', './product-detail-minimal.css', './store-template-polish.css']) {
  if (!uiPolish.includes(requiredImport)) {
    console.error(`Preflight failed. app/ui-polish.css is missing ${requiredImport}.`);
    process.exit(1);
  }
}

console.log('Production preflight passed.');
