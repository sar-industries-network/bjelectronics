import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const root = lock.packages?.[''] || {};
const failures = [];

if (lock.name !== pkg.name) failures.push(`lock name ${lock.name} does not match package ${pkg.name}`);
if (lock.version !== pkg.version) failures.push(`lock version ${lock.version} does not match package ${pkg.version}`);
if (root.name !== pkg.name) failures.push(`lock root name ${root.name} does not match package ${pkg.name}`);
if (root.version !== pkg.version) failures.push(`lock root version ${root.version} does not match package ${pkg.version}`);

for (const section of ['dependencies', 'devDependencies']) {
  const expected = pkg[section] || {};
  const actual = root[section] || {};
  for (const [name, version] of Object.entries(expected)) {
    if (actual[name] !== version) failures.push(`${section}.${name} lock=${actual[name] || 'missing'} package=${version}`);
  }
}

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/lock-consistency.md', ['# Package Lock Consistency', '', failures.length ? 'Failed:' : 'Passed.', ...failures.map((item) => `- ${item}`)].join('\n') + '\n');

if (failures.length) {
  console.error('Package lock consistency failed. Run npm install and commit package-lock.json.');
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Package lock consistency passed.');
