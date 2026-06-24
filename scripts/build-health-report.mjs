import fs from 'node:fs';

fs.mkdirSync('reports', { recursive: true });
const sections = [
  ['Environment', 'reports/env-check.md'],
  ['Lock Consistency', 'reports/lock-consistency.md'],
  ['CSS Audit', 'reports/css-audit.md'],
  ['Dead Import Scan', 'reports/dead-import-scan.md'],
  ['Functional Smoke', 'reports/functional-smoke.md'],
  ['Build Output Audit', 'reports/build-audit.md']
];

const now = new Date().toISOString();
const lines = ['# BJ ELECTRONICS Build Health Report', '', `Generated: ${now}`, '', '## Summary', '', '- Preflight completed before build.', '- TypeScript, build, route smoke and functional smoke should be checked by CI.', '- See sections below for audit details.', ''];
for (const [title, file] of sections) {
  lines.push(`## ${title}`, '');
  if (fs.existsSync(file)) lines.push(fs.readFileSync(file, 'utf8').replace(/^# .+\n?/, '').trim() || 'No details.');
  else lines.push('Report not generated in this run.');
  lines.push('');
}

fs.writeFileSync('reports/build-health.md', `${lines.join('\n')}\n`);
console.log('Build health report generated at reports/build-health.md');
