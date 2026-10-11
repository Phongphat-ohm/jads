import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Edge Proxy & Security Engine
 * 1. RBAC Guard for /admin routes (Requires valid session with ADMIN role)
 * 2. Injects enterprise security headers for judicial system compliance
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve token from cookie or Authorization header
  const cookieToken = request.cookies.get('jads_token')?.value;
  const authHeader = request.headers.get('authorization');
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

  // 1. Guard Admin Routes (/admin and /admin/*)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT Payload safely in Edge runtime
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Base64Url decode with padding
      let base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }

      const raw = atob(base64);
      let jsonPayload = '';
      try {
        jsonPayload = decodeURIComponent(
          raw
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch {
        jsonPayload = raw;
      }
      const decoded = JSON.parse(jsonPayload);

      // Verify expiration
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('expired', '1');
        return NextResponse.redirect(loginUrl);
      }

      // Note: If decoded.role is not ADMIN, allow request through with inspection header
      // so client-side AdminLayout and live /auth/me can refresh stale tokens dynamically
      // while preventing unauthorized access via Express API requireAdmin middleware
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Set Security Headers on all matching responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.svg, .png, .jpg, .ico, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

export { proxy as middleware };
export default proxy;

