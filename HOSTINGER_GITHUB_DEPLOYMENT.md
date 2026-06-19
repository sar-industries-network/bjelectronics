# Hostinger GitHub Deployment Guide (BJ Electronics)

## Framework
- Next.js static export (`next.config.mjs -> output: 'export'`)

## Build Output
- `/out` folder is deployed as static site

## Required Hostinger GitHub Settings

### Repository
```
sar-industries-network/bjelectronics
```

### Branch
```
main
```

### Build command
```
npm install && npm run build
```

### Output directory
```
out
```

### Node version
```
20.x
```

## Environment Variables (Hostinger)
Add only frontend-safe variables:
```
NEXT_PUBLIC_SITE_URL=https://bjelectronics.shop
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ Do NOT expose admin passwords in NEXT_PUBLIC variables.

## Deployment Flow
1. Push code to GitHub
2. Hostinger auto pulls repo
3. Runs build
4. Generates `/out`
5. Serves static site

## Common Issues

### 1. 404 on routes
- Ensure `.htaccess` exists in `/out`

### 2. Blank page
- Check `out/index.html` exists

### 3. Images broken
- Ensure `next/image` uses `unoptimized: true`

## Notes
This project is fully static and does NOT require Node.js runtime in production.
