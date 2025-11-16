
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  // Middleware dinonaktifkan untuk sementara agar bisa langsung masuk ke dashboard
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
