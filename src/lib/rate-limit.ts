/**
 * Rate limiting en memoria (por IP).
 * Almacena timestamps por clave en un Map.
 * No persiste entre reinicios del servidor.
 *
 * Nota: En producción multi-instancia se recomienda Redis o similar.
 */

const almacen = new Map<string, number[]>()

/** Limpia timestamps viejos cada 5 minutos */
setInterval(() => {
  const ahora = Date.now()
  const entradas = Array.from(almacen)
  for (let i = 0; i < entradas.length; i++) {
    const [key, timestamps] = entradas[i]
    const vigentes = timestamps.filter(t => ahora - t < 60_000)
    if (vigentes.length) almacen.set(key, vigentes)
    else almacen.delete(key)
  }
}, 300_000)

/**
 * Extrae la IP real del request, ignorando X-Forwarded-For spoofed
 * cuando el servidor no está detrás de un proxy confiable.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(first)) return first
  }
  return headers.get('x-real-ip') || '127.0.0.1'
}

/**
 * Verifica si una clave puede continuar según el límite.
 * @param key  Identificador único (ej: "login:127.0.0.1")
 * @param max  Máximo de requests permitidos
 * @param windowMs  Ventana de tiempo en ms
 */
export function checkRateLimit(key: string, max: number, windowMs: number = 60_000): { allowed: boolean } {
  const ahora = Date.now()
  const registros = almacen.get(key) || []
  const vigentes = registros.filter(t => ahora - t < windowMs)

  if (vigentes.length >= max) {
    return { allowed: false }
  }

  vigentes.push(ahora)
  almacen.set(key, vigentes)
  return { allowed: true }
}
