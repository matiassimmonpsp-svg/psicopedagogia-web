import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const RUTAS_PROTEGIDAS = ['/admin']

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

const isDev = process.env.NODE_ENV === 'development'
const CSP = [
  "default-src 'self'",
  `script-src ${isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self'"}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://graph.instagram.com https://*.instagram.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (RUTAS_PROTEGIDAS.some(r => pathname.startsWith(r))) {
    const token = request.cookies.get('session')?.value
    const user = token ? await verifyToken(token) : null

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url))
    }
  }

  const response = NextResponse.next()
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  response.headers.set('Content-Security-Policy', CSP)

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next|api|favicon.ico|uploads).*)'],
}
