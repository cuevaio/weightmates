import { NextResponse, type NextRequest } from 'next/server';

import {
  SESSION_TOKEN_COOKIE_EXPIRES_IN_S,
  SESSION_TOKEN_COOKIE_NAME,
} from './auth/constants';
import { nocache_getSession } from './auth/middleware';

const PROTECTED_PATHS = ['/invites', '/teams', '/users'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname.startsWith('/api/webhook/stripe')) {
    return NextResponse.next();
  }

  // Check auth for protected paths
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtectedPath) {
    const auth = await nocache_getSession(request);
    if (!auth) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Handle GET requests
  if (request.method === 'GET') {
    const response = NextResponse.next();
    const token = request.cookies.get(SESSION_TOKEN_COOKIE_NAME)?.value ?? null;
    if (token !== null) {
      response.cookies.set(SESSION_TOKEN_COOKIE_NAME, token, {
        path: '/',
        maxAge: SESSION_TOKEN_COOKIE_EXPIRES_IN_S,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return response;
  }

  // Check origin and host headers
  const originHeader = request.headers.get('origin');
  const hostHeader = request.headers.get('x-forwarded-host');

  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, { status: 403 });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return new NextResponse(null, { status: 403 });
  }

  if (origin.host !== hostHeader) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}
