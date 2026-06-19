import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative, sep } from 'path';

console.log('Postbuild: preparing Hostinger deployment assets...');

const outDir = 'out';
const appHtmlDir = '.next/server/app';
const nextStaticDir = '.next/static';
const publicDir = 'public';
const htaccessSource = 'hostinger/.htaccess';
const htaccessDest = 'out/.htaccess';

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function copyIfExists(source, destination) {
  if (!existsSync(source)) return false;
  ensureDir(dirname(destination));
  copyFileSync(source, destination);
  return true;
}

function copyDirIfExists(source, destination) {
  if (!existsSync(source)) return false;
  ensureDir(destination);
  cpSync(source, destination, { recursive: true });
  return true;
}

function walkFiles(dir) {
  const result = [];
  if (!existsSync(dir)) return result;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) result.push(...walkFiles(full));
    else result.push(full);
  }
  return result;
}

function htmlRouteDestination(htmlFile) {
  const rel = relative(appHtmlDir, htmlFile).split(sep).join('/');
  if (rel === 'index.html') return 'out/index.html';
  if (rel === '404.html') return 'out/404.html';
  if (rel.endsWith('/index.html')) return join(outDir, rel);
  const withoutExt = rel.replace(/\.html$/, '');
  return join(outDir, withoutExt, 'index.html');
}

function buildFallbackOutFromNextServer() {
  if (!existsSync(appHtmlDir)) return false;

  console.log('out directory was missing. Creating fallback static output from .next/server/app...');
  ensureDir(outDir);

  const htmlFiles = walkFiles(appHtmlDir).filter((file) => file.endsWith('.html'));
  for (const file of htmlFiles) {
    const dest = htmlRouteDestination(file);
    copyIfExists(file, dest);
  }

  copyDirIfExists(nextStaticDir, 'out/_next/static');
  copyDirIfExists(publicDir, outDir);

  if (!existsSync('out/index.html')) {
    console.error('Fallback failed: out/index.html was not created.');
    return false;
  }

  console.log(`Fallback static output created with ${htmlFiles.length} HTML files.`);
  return true;
}

try {
  if (!existsSync(outDir)) {
    const recovered = buildFallbackOutFromNextServer();
    if (!recovered) {
      console.error('ERROR: out directory missing and fallback output could not be created.');
      process.exit(1);
    }
  }

  if (copyIfExists(htaccessSource, htaccessDest)) {
    console.log('.htaccess copied to out successfully');
  } else {
    console.log('No .htaccess found in hostinger folder');
  }

  if (!existsSync('out/index.html')) {
    console.error('ERROR: out/index.html is missing after postbuild.');
    process.exit(1);
  }

  console.log('Hostinger deployment output is ready in /out');
} catch (err) {
  console.error('Postbuild error:', err);
  process.exit(1);
}
