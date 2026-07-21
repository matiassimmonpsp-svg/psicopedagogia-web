import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { csrfCheck } from '@/lib/csrf'
import { blacklistToken, SESSION_COOKIE } from '@/lib/auth'
import { logger } from '@/lib/logger'

/** POST /api/auth/logout — Invalida sesión y token */
export async function POST(request: NextRequest) {
  try {
    const csrf = csrfCheck(request)
    if (csrf) return csrf

    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (token) {
      await blacklistToken(token)
    }
    cookieStore.delete(SESSION_COOKIE)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al cerrar sesión', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 })
  }
}
