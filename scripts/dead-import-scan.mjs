import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceExt = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const resolvableExt = [...sourceExt, '.css', '.json'];
const ignoreDirs = new Set(['node_modules', '.next', 'out', '.git', 'reports']);
const entryFiles = new Set([
  'app/layout.tsx',
  'app/page.tsx',
  'app/admin/page.tsx',
  'scripts/preflight.mjs',
  'scripts/route-smoke-test.mjs'
]);
const forbiddenScanExempt = new Set([
  'scripts/preflight.mjs',
  'scripts/dead-import-scan.mjs'
]);
const forbiddenTokens = ['enterprise-app', 'admin-dashboard-pro', 'command-center-client'];
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (sourceExt.includes(path.extname(entry.name))) files.push(path.relative(root, full).replace(/\\/g, '/'));
  }
}
walk(root);

function resolveImport(fromFile, spec) {
  if (spec.startsWith('node:') || (!spec.startsWith('.') && !spec.startsWith('@/'))) return null;
  const base = spec.startsWith('@/') ? path.join(root, spec.slice(2)) : path.resolve(path.dirname(path.join(root, fromFile)), spec);
  const candidates = [];
  if (path.extname(base)) candidates.push(base);
  for (const ext of resolvableExt) candidates.push(`${base}${ext}`);
  for (const ext of resolvableExt) candidates.push(path.join(base, `index${ext}`));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return path.relative(root, candidate).replace(/\\/g, '/');
  }
  return '__UNRESOLVED__';
}

const unresolved = [];
const imported = new Set();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const specs = [...text.matchAll(/import(?:[^'";]*?from\s*)?['"]([^'"]+)['"]/g)].map((m) => m[1]);
  for (const spec of specs) {
    const resolved = resolveImport(file, spec);
    if (resolved === '__UNRESOLVED__') unresolved.push({ file, spec });
    else if (resolved) imported.add(resolved);
  }
}

const likelyDead = files.filter((file) => {
  if (entryFiles.has(file)) return false;
  if (file.startsWith('app/') && file.endsWith('/page.tsx')) return false;
  if (file.startsWith('scripts/')) return false;
  return !imported.has(file);
}).sort();

const forbiddenRefs = [];
for (const file of files) {
  if (forbiddenScanExempt.has(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const token of forbiddenTokens) {
    if (text.includes(token)) forbiddenRefs.push({ file, token });
  }
}

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/dead-import-scan.json', JSON.stringify({ unresolved, likelyDead, forbiddenRefs }, null, 2));
fs.writeFileSync('reports/dead-import-scan.md', [
  '# Dead Import Scan',
  '',
  `Scanned files: ${files.length}`,
  `Unresolved local imports: ${unresolved.length}`,
  `Likely dead files: ${likelyDead.length}`,
  `Forbidden legacy references: ${forbiddenRefs.length}`,
  '',
  '## Unresolved local imports',
  ...(unresolved.length ? unresolved.map((item) => `- ${item.file}: ${item.spec}`) : ['- None']),
  '',
  '## Likely dead files',
  ...(likelyDead.length ? likelyDead.slice(0, 60).map((file) => `- ${file}`) : ['- None']),
  '',
  '## Forbidden legacy references',
  ...(forbiddenRefs.length ? forbiddenRefs.map((item) => `- ${item.file}: ${item.token}`) : ['- None'])
].join('\n') + '\n');

if (unresolved.length || forbiddenRefs.length) {
  console.error('Dead import scan failed. See reports/dead-import-scan.md');
  process.exit(1);
}
console.log(`Dead import scan complete. Likely dead files reported: ${likelyDead.length}.`);
