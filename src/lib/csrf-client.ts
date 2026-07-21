/**
 * Fetch wrapper que automáticamente incluye el token CSRF en requests state-changing.
 * Double-submit cookie pattern: el token se envía tanto en cookie (httpOnly) como en header.
 */

let csrfToken: string | null = null

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/csrf', { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    csrfToken = data.csrfToken ?? null
    return csrfToken
  } catch {
    csrfToken = null
    return null
  }
}

function setCsrfHeader(options: RequestInit, token: string): RequestInit {
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = { 'X-CSRF-Token': token }
  if (!isFormData) {
    headers['Content-Type'] = options.headers instanceof Headers
      ? options.headers.get('Content-Type') || 'application/json'
      : (options.headers as Record<string, string>)?.['Content-Type'] || 'application/json'
  }

  return {
    ...options,
    headers: isFormData ? { 'X-CSRF-Token': token } : headers,
    credentials: 'include',
  }
}

/** Fetch con protección CSRF automática para mutations */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase()
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

  if (isMutation) {
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    if (csrfToken) {
      options = setCsrfHeader(options, csrfToken)
    }
  }

  let res = await fetch(url, options)

  // Si el token expiró (403), refrescar y reintentar una vez
  if (isMutation && res.status === 403) {
    const newToken = await fetchCsrfToken()
    if (newToken) {
      options = setCsrfHeader(options, newToken)
      res = await fetch(url, options)
    }
  }

  return res
}

/** Limpia el token cache (útil al hacer logout) */
export function clearCsrfToken() {
  csrfToken = null
}
