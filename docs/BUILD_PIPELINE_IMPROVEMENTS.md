# BJ ELECTRONICS Build Pipeline Improvements

## Implemented

1. Lint is now part of the GitHub Actions build flow.
2. Bundle/output size audit added through `scripts/build-audit.mjs`.
3. CSS size and duplicate-selector audit added through `scripts/css-audit.mjs`.
4. Environment variable validation added through `scripts/env-check.mjs`.
5. Route smoke tests expanded for dynamic product, category and order-success routes.
6. Cart/checkout/order functional smoke tests added through `scripts/functional-smoke.mjs`.
7. Package-lock consistency check added through `scripts/lock-consistency.mjs`.
8. Hostinger upload zip artifact generation added through `scripts/hostinger-zip.mjs`.
9. Build health report generation added through `scripts/build-health-report.mjs`.
10. Dead import and unused-file scanner added through `scripts/dead-import-scan.mjs`.

## New scripts

```bash
npm run env:check
npm run env:check:strict
npm run lock:check
npm run audit:css
npm run audit:dead
npm run audit:build
npm run smoke:functional
npm run health:report
npm run artifact:zip
npm run verify
```

## New reports

Build runs now create files inside `reports/`:

- `env-check.md`
- `lock-consistency.md`
- `css-audit.md`
- `dead-import-scan.md`
- `functional-smoke.md`
- `build-audit.md`
- `build-health.md`

## Hostinger artifact

The build now generates:

- `bjelectronics-hostinger-out.zip`

This zip contains the static export from the `out` folder and can be uploaded to Hostinger.

## GitHub Actions

The CI workflow now runs:

1. install dependencies
2. production preflight
3. environment validation
4. package-lock consistency check
5. CSS audit
6. dead import scan
7. lint
8. typecheck
9. Next static build
10. route smoke checks
11. functional smoke checks
12. build output audit
13. build health report
14. Hostinger zip generation
15. artifact upload

## Local verification

Run:

```bash
npm install
npm run verify
```

If `lock:check` fails locally, run `npm install` once and commit the refreshed `package-lock.json`.
