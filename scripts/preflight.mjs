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
  'components/storefront-app.tsx',
  'components/admin-shell.tsx',
  'components/pro-product-detail-live.tsx',
  'lib/supabaseClient.ts',
  'scripts/route-smoke-test.mjs',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Preflight failed. Missing required files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) {
  console.error(`Preflight failed. Node 20+ required, current Node is ${process.versions.node}.`);
  process.exit(1);
}

const uiPolish = fs.readFileSync('app/ui-polish.css', 'utf8');
for (const requiredImport of ['./design-system.css', './responsive-system.css', './product-detail-minimal.css']) {
  if (!uiPolish.includes(requiredImport)) {
    console.error(`Preflight failed. app/ui-polish.css is missing ${requiredImport}.`);
    process.exit(1);
  }
}

console.log('Production preflight passed.');
