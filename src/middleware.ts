
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth';

const protectedRoutes = ['/dashboard'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
