/**
 * Rate limiting con Redis (Upstash) para producción multi-instancia.
 * Fallback a memoria si no hay Redis configurado.
 */

import { Redis } from '@upstash/redis'

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Fallback en memoria para desarrollo
const memoria = new Map<string, number[]>()

if (!redis) {
  setInterval(() => {
    const ahora = Date.now()
    for (const [key, timestamps] of Array.from(memoria.entries())) {
      const vigentes = timestamps.filter((t: number) => ahora - t < 60_000)
      if (vigentes.length) memoria.set(key, vigentes)
      else memoria.delete(key)
    }
  }, 300_000)
}

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
export async function checkRateLimit(key: string, max: number, windowMs: number = 60_000): Promise<{ allowed: boolean }> {
  const ahora = Date.now()
  const windowSec = Math.ceil(windowMs / 1000)

  if (redis) {
    // Redis: usa sorted set con score = timestamp
    const now = Date.now()
    const minScore = now - windowMs

    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, minScore)
    pipeline.zcard(key)
    const results = await pipeline.exec()

    const currentCount = results[1] as number

    if (currentCount >= max) {
      return { allowed: false }
    }

    // Agregar request actual
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    await redis.expire(key, windowSec)
    return { allowed: true }
  } else {
    // Fallback memoria
    const registros = memoria.get(key) || []
    const vigentes = registros.filter(t => ahora - t < windowMs)

    if (vigentes.length >= max) {
      return { allowed: false }
    }

    vigentes.push(ahora)
    memoria.set(key, vigentes)
    return { allowed: true }
  }
}