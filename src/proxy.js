import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'kpu_panitia_session';

/**
 * Proxy / Middleware Auth Guard untuk memproteksi rute internal panitia
 * @param {import('next/server').NextRequest} request
 */
export function proxyMiddleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  let isLoggedIn = false;
  let userRole = '';

  if (sessionCookie?.value) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
      if (decoded && decoded.adminId && (!decoded.exp || Date.now() < decoded.exp)) {
        isLoggedIn = true;
      }
    } catch (e) {
      isLoggedIn = false;
    }
  }

  // Jika halaman panitia (kecuali /panitia/login) diakses tanpa login, redirect ke login
  if (pathname.startsWith('/panitia') && !pathname.startsWith('/panitia/login')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/panitia/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika sudah login dan membuka /panitia/login, alihkan ke root /panitia
  if (pathname === '/panitia/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/panitia', request.url));
  }

  return NextResponse.next();
}

export default proxyMiddleware;
