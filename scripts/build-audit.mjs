import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  console.error('Build audit failed: out directory is missing. Run npm run build first.');
  process.exit(1);
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const stat = fs.statSync(full);
      files.push({ path: path.relative(outDir, full).replace(/\\/g, '/'), bytes: stat.size });
    }
  }
}
walk(outDir);

const htaccessPath = path.join(outDir, '.htaccess');
const htaccess = fs.existsSync(htaccessPath) ? fs.readFileSync(htaccessPath, 'utf8') : '';
const failures = [];
for (const required of ['Content-Security-Policy', 'connect-src', 'supabase.co', 'RewriteEngine On', 'admin/login', 'admin/categories']) {
  if (!htaccess.includes(required)) failures.push(`out/.htaccess is missing ${required}`);
}

const totalBytes = files.reduce((sum, item) => sum + item.bytes, 0);
const js = files.filter((item) => item.path.endsWith('.js')).sort((a, b) => b.bytes - a.bytes).slice(0, 15);
const css = files.filter((item) => item.path.endsWith('.css')).sort((a, b) => b.bytes - a.bytes).slice(0, 15);
const html = files.filter((item) => item.path.endsWith('.html'));
const largeAssets = files.filter((item) => item.bytes > 350 * 1024).sort((a, b) => b.bytes - a.bytes).slice(0, 20);

const report = { totalBytes, fileCount: files.length, htmlRoutes: html.length, largestJs: js, largestCss: css, largeAssets, hostingerRules: failures.length ? 'failed' : 'passed' };
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/build-audit.json', JSON.stringify(report, null, 2));
fs.writeFileSync('reports/build-audit.md', [
  '# Build Output Audit',
  '',
  `Files: ${files.length}`,
  `HTML routes: ${html.length}`,
  `Total output size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
  `Hostinger routing/security rules: ${failures.length ? 'Failed' : 'Passed'}`,
  ...(failures.length ? failures.map((item) => `- ${item}`) : []),
  '',
  '## Largest JS',
  ...(js.length ? js.map((item) => `- ${item.path}: ${(item.bytes / 1024).toFixed(2)} KB`) : ['- None']),
  '',
  '## Largest CSS',
  ...(css.length ? css.map((item) => `- ${item.path}: ${(item.bytes / 1024).toFixed(2)} KB`) : ['- None']),
  '',
  '## Large assets over 350 KB',
  ...(largeAssets.length ? largeAssets.map((item) => `- ${item.path}: ${(item.bytes / 1024).toFixed(2)} KB`) : ['- None'])
].join('\n') + '\n');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Build audit complete: ${(totalBytes / 1024 / 1024).toFixed(2)} MB, ${files.length} files.`);
