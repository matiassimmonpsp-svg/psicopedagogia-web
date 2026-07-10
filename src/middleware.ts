import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const RUTAS_PROTEGIDAS = ['/admin']

/** Middleware global: protege rutas admin, agrega headers de seguridad */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /* Protección de rutas admin */
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

  /* Headers de seguridad */
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  const isDev = process.env.NODE_ENV === 'development'
  const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self'"
  const styleSrc = isDev ? "'self' 'unsafe-inline' https://fonts.googleapis.com" : "'self' 'unsafe-inline' https://fonts.googleapis.com"

  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    `script-src ${scriptSrc}; ` +
    `style-src ${styleSrc}; ` +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://graph.instagram.com https://*.instagram.com; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'; " +
    "base-uri 'self'; " +
    "object-src 'none'"
  )

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
