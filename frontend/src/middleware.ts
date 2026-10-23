import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.get('wms_auth')?.value === '1';
  const isLogin = request.nextUrl.pathname.startsWith('/login');

  if (!isAuthed && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthed && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
