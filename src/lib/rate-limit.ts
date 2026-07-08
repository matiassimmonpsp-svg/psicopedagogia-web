/**
 * Rate limiting en memoria (por IP).
 * Almacena timestamps por clave en un Map.
 * Nopersiste entre reinicios del servidor.
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
