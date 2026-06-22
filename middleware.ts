import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// SIMPLE PRODUCTION GUARD FOR ADMIN ROUTES
// Uses Supabase auth cookie if available

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const accessToken =
      req.cookies.get('sb-access-token')?.value ||
      req.cookies.get('supabase-auth-token')?.value;

    if (!accessToken) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
