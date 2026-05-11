import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = path.startsWith('/admin') && path !== '/admin/login';

  if (isProtectedRoute) {
    const cookie = req.cookies.get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId || session?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }
  }

  // Rate Limiting (Bot protection mockup)
  // Check headers etc in a fully fledged logic
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
