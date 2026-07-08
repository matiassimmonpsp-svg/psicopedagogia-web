import { NextRequest, NextResponse } from 'next/server'
import { csrfCheck } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  const response = NextResponse.json({ ok: true })
  response.cookies.set('session', '', { maxAge: 0, path: '/' })
  return response
}
