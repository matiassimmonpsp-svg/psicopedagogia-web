/**
 * Rate limiting con Redis (Upstash) para producción multi-instancia.
 * Fallback a memoria si no hay Redis configurado.
 */

import { Redis } from '@upstash/redis'
import crypto from 'crypto'

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Fallback en memoria para desarrollo
const MAX_RATELIMIT_SIZE = 10_000
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
 * Extrae la IP real del request.
 * En producción (detrás de Vercel/Cloudflare), X-Forwarded-For es confiable.
 * En desarrollo, usa X-Real-IP o fallback a 127.0.0.1.
 * NUNCA confía en X-Forwarded-For en desarrollo (spoofable por el cliente).
 */
export function getClientIp(headers: Headers): string {
  // En producción, Vercel/Cloudflare setean X-Forwarded-For de forma confiable
  if (process.env.NODE_ENV === 'production') {
    const forwarded = headers.get('x-forwarded-for')
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim()
      if (first && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(first)) return first
    }
  }

  // X-Real-IP: solo lo setea un reverse proxy (nginx, Caddy), no spoofable por el cliente
  const realIp = headers.get('x-real-ip')
  if (realIp && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(realIp)) return realIp

  return '127.0.0.1'
}

/**
 * Hashea una IP para almacenamiento seguro (GDPR/Ley 19.628).
 * La IP hasheada no se puede revertir, pero se puede usar para analytics.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT
  if (!salt) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('IP_HASH_SALT debe estar configurado en producción')
    }
    return crypto.createHash('sha256').update(`dev-salt:${ip}`).digest('hex').slice(0, 16)
  }
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16)
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
    if (memoria.size >= MAX_RATELIMIT_SIZE) {
      const oldest = memoria.keys().next().value
      if (oldest) memoria.delete(oldest)
    }
    memoria.set(key, vigentes)
    return { allowed: true }
  }
}