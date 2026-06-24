import fs from 'node:fs';
import path from 'node:path';

const ignoreDirs = new Set(['node_modules', '.next', 'out', '.git', 'reports']);
const ignoreFiles = new Set(['scripts/secret-scan.mjs']);
const findings = [];
const patterns = [
  { name: 'supabase-project-url', regex: /https:\/\/[a-z0-9]{20}\.supabase\.co/gi },
  { name: 'supabase-publishable-key', regex: /sb_publishable_[A-Za-z0-9_-]{20,}/g },
  { name: 'supabase-secret-key', regex: /sb_secret_[A-Za-z0-9_-]{20,}/g },
  { name: 'jwt-like-secret', regex: /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}/g }
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const rel = path.relative(process.cwd(), full).replace(/\\/g, '/');
      if (ignoreFiles.has(rel)) continue;
      if (['.png', '.jpg', '.jpeg', '.webp', '.zip', '.pdf'].some((ext) => rel.endsWith(ext))) continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const pattern of patterns) {
        if (pattern.regex.test(text)) findings.push({ file: rel, pattern: pattern.name });
        pattern.regex.lastIndex = 0;
      }
    }
  }
}
walk(process.cwd());
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/secret-scan.md', ['# Secret Scan', '', findings.length ? 'Failed:' : 'Passed.', ...findings.map((item) => `- ${item.file}: ${item.pattern}`)].join('\n') + '\n');
if (findings.length) {
  console.error('Secret scan failed. See reports/secret-scan.md');
  process.exit(1);
}
console.log('Secret scan passed.');
