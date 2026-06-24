import fs from 'node:fs';
import path from 'node:path';

const roots = ['app'];
const cssFiles = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.css')) cssFiles.push(full);
  }
}
roots.forEach(walk);

const selectorCounts = new Map();
let totalBytes = 0;
const fileStats = [];
for (const file of cssFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const bytes = Buffer.byteLength(text);
  totalBytes += bytes;
  fileStats.push({ file, bytes });
  const cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const matches = cleaned.match(/([^{}@][^{}]+)\s*\{/g) || [];
  for (const match of matches) {
    const selector = match.replace(/\{$/, '').trim();
    if (!selector || selector.includes('%')) continue;
    for (const part of selector.split(',').map((item) => item.trim()).filter(Boolean)) {
      selectorCounts.set(part, (selectorCounts.get(part) || 0) + 1);
    }
  }
}

const duplicates = [...selectorCounts.entries()].filter(([, count]) => count > 3).sort((a, b) => b[1] - a[1]).slice(0, 30);
const largest = fileStats.sort((a, b) => b.bytes - a.bytes).slice(0, 15);
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/css-audit.json', JSON.stringify({ totalBytes, fileCount: cssFiles.length, largest, duplicates }, null, 2));
fs.writeFileSync('reports/css-audit.md', [
  '# CSS Audit',
  '',
  `CSS files: ${cssFiles.length}`,
  `Total CSS source size: ${(totalBytes / 1024).toFixed(2)} KB`,
  '',
  '## Largest CSS files',
  ...largest.map((item) => `- ${item.file}: ${(item.bytes / 1024).toFixed(2)} KB`),
  '',
  '## High-repeat selectors',
  ...(duplicates.length ? duplicates.map(([selector, count]) => `- ${selector}: ${count}`) : ['- None over threshold'])
].join('\n') + '\n');

console.log(`CSS audit complete: ${cssFiles.length} files, ${(totalBytes / 1024).toFixed(2)} KB.`);
