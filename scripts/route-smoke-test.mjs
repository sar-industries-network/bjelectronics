import fs from 'node:fs';
import path from 'node:path';

const requiredRoutes = [
  'index.html',
  'admin/index.html',
  'admin/products/index.html',
  'admin/product-manager/index.html',
  'admin/platform/index.html',
  'admin/command-center/index.html',
  'products/index.html',
  'cart/index.html',
  'checkout/index.html',
  'track-order/index.html',
];

const missing = requiredRoutes.filter((route) => !fs.existsSync(path.join(process.cwd(), 'out', route)));

if (missing.length) {
  console.error('Missing static export routes:');
  for (const route of missing) console.error(`- out/${route}`);
  process.exit(1);
}

console.log(`Route smoke test passed (${requiredRoutes.length} routes).`);
