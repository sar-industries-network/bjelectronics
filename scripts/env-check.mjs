import fs from 'node:fs';
import process from 'node:process';

const strict = process.argv.includes('--strict') || process.env.CI === 'true';
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_ADMIN_EMAIL'
];

const forbidden = ['NEXT_PUBLIC_ADMIN_ACCESS_CODE'];
const missing = required.filter((key) => !String(process.env[key] || '').trim());
const present = required.filter((key) => String(process.env[key] || '').trim());
const forbiddenPresent = forbidden.filter((key) => String(process.env[key] || '').trim());

fs.mkdirSync('reports', { recursive: true });
const lines = [
  '# Environment Validation',
  '',
  `Mode: ${strict ? 'strict' : 'local'}`,
  '',
  `Required present: ${present.length}/${required.length}`,
  '',
  ...required.map((key) => `- ${key}: ${process.env[key] ? 'present' : 'missing'}`),
  '',
  'Forbidden public variables:',
  ...forbidden.map((key) => `- ${key}: ${process.env[key] ? 'remove immediately' : 'not set'}`)
];
fs.writeFileSync('reports/env-check.md', `${lines.join('\n')}\n`);

if (forbiddenPresent.length) {
  console.error(`Forbidden public environment variables must be removed: ${forbiddenPresent.join(', ')}`);
  process.exit(1);
}

if (missing.length) {
  const message = `Missing required environment variables: ${missing.join(', ')}`;
  if (strict) {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
} else {
  console.log('Environment validation passed.');
}
