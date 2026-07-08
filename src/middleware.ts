import { NextResponse, NextRequest } from 'next/server'

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = request.cookies.get('session')?.value
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const payload = decodeJwtPayload(session)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://graph.instagram.com",
    "frame-src https://www.instagram.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: '/:path*',
}
