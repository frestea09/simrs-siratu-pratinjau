
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  
  const session = await getSession();

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
  
  // Optional: Redirect logged-in users from public routes like the login page
  if (publicRoutes.includes(path) && session) {
      return NextResponse.redirect(new URL('/dashboard/overview', req.nextUrl));
  }

  return NextResponse.next();
}

// Matcher unchanged
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
