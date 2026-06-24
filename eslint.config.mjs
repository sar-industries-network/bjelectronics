import next from 'eslint-config-next';

export default [
  ...next,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'public/**'
    ],
    rules: {
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off'
    }
  }
];
