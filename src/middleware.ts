import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'

const RUTAS_PROTEGIDAS = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (RUTAS_PROTEGIDAS.some(r => pathname.startsWith(r))) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
