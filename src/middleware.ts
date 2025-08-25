
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const sessionRes = await fetch(new URL('/api/session', req.url), {
      headers: { cookie: req.headers.get('cookie') ?? '' },
    });
    const { user } = await sessionRes.json();
    if (!user) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Matcher unchanged
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
