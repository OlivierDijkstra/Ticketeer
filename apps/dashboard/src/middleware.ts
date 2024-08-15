import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

import { auth } from '@/auth';
import { fetchWithAuth } from '@/lib/fetch';

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}

async function onInvalidAuth(req: NextAuthRequest) {
  const callbackUrl = new URL('/', req.nextUrl.origin);
  callbackUrl.searchParams.set('callbackUrl', req.nextUrl.toString());
  const response = NextResponse.redirect(callbackUrl);

  if (req.auth) {
    const cookiesToDelete = req.auth.user.cookies;

    const url = new URL(req.nextUrl.origin);
    const hostnameParts = url.hostname.split('.');
    const domain =
      hostnameParts.length > 2
        ? hostnameParts.slice(-2).join('.')
        : url.hostname;

    cookiesToDelete.forEach((cookie) => {
      response.cookies.set(cookie, '', {
        domain: `.${domain}`,
        maxAge: 0,
      });
    });
  }

  return response;
}

export default auth(async (req) => {
  if (!req.auth && req.nextUrl.pathname !== '/') {
    const response = await onInvalidAuth(req);
    return response;
  }

  if (req.nextUrl.pathname === '/') return;

  try {
    await fetchWithAuth('api/users/me', { method: 'GET' });
  } catch (error) {
    const response = await onInvalidAuth(req);
    return response;
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
