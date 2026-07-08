import { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)

function getOrigin(request: NextRequest): string | null {
  return request.headers.get('origin')
}

function getReferer(request: NextRequest): string | null {
  return request.headers.get('referer')
}

function matchOrigin(allowed: string, actual: string): boolean {
  if (!allowed || !actual) return false
  const a = allowed.replace(/\/+$/, '').toLowerCase()
  const b = actual.replace(/\/+$/, '').toLowerCase()
  return a === b
}

export function csrfCheck(request: NextRequest): Response | null {
  if (request.method === 'GET' || request.method === 'HEAD') return null

  const origin = getOrigin(request)
  const referer = getReferer(request)
  const originOrReferer = origin || (referer ? new URL(referer).origin : null)

  if (!originOrReferer) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (ALLOWED_ORIGINS.length > 0) {
    const allowed = ALLOWED_ORIGINS.some(o => matchOrigin(o, originOrReferer))
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return null
  }

  const host = request.headers.get('host') || ''
  const expectedOrigin = `${request.nextUrl.protocol}//${host}`

  if (!matchOrigin(expectedOrigin, originOrReferer)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return null
}
