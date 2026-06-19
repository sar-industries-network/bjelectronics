import { copyFileSync, existsSync, mkdirSync } from 'fs';

console.log('Postbuild: preparing Hostinger deployment assets...');

const source = 'hostinger/.htaccess';
const destDir = 'out';
const dest = 'out/.htaccess';

try {
  if (!existsSync(destDir)) {
    console.log('out directory not found. skipping hostinger asset copy.');
    process.exit(0);
  }

  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log('.htaccess copied to out successfully');
  } else {
    console.log('No .htaccess found in hostinger folder');
  }
} catch (err) {
  console.error('Postbuild error:', err);
  process.exit(0);
}
