import { cookies } from 'next/headers'
import { Redis } from '@upstash/redis'
import crypto from 'crypto'
import { prisma } from './prisma'
import { verifyToken, SESSION_COOKIE, type AuthUser } from './auth-jwt'

const TOKEN_TTL_SEC = 60 * 60
const MAX_BLOCKLIST_SIZE = 10_000
const blocklistMemoria = new Map<string, number>()

function tokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function blacklistToken(token: string): Promise<void> {
  const hash = tokenHash(token)
  if (redis) {
    await redis.setex(`bl:${hash}`, TOKEN_TTL_SEC, '1')
  } else {
    if (blocklistMemoria.size >= MAX_BLOCKLIST_SIZE) {
      const oldest = blocklistMemoria.keys().next().value
      if (oldest) blocklistMemoria.delete(oldest)
    }
    blocklistMemoria.set(hash, Date.now() + TOKEN_TTL_SEC * 1000)
  }
}

async function isTokenBlacklisted(token: string): Promise<boolean> {
  const hash = tokenHash(token)
  if (redis) {
    return (await redis.get(`bl:${hash}`)) === '1'
  }
  const expiry = blocklistMemoria.get(hash)
  if (!expiry) return false
  if (Date.now() > expiry) {
    blocklistMemoria.delete(hash)
    return false
  }
  return true
}

const MAX_SESSION_CACHE_SIZE = 10_000
const sessionCache = new Map<string, { user: AuthUser; expiry: number }>()
const SESSION_TTL_MS = 30_000

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return null
}

const redis = getRedis()
const SESSION_TTL_SEC = 30

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  if (await isTokenBlacklisted(token)) {
    cookieStore.delete(SESSION_COOKIE)
    return null
  }

  const cacheKey = `session:${token}`

  if (redis) {
    const cached = await redis.get<string>(cacheKey)
    if (cached) return JSON.parse(cached)
  }

  const mem = sessionCache.get(token)
  if (mem && mem.expiry > Date.now()) return mem.user

  const payload = await verifyToken(token)
  if (!payload) {
    if (redis) await redis.del(cacheKey)
    else sessionCache.delete(token)
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true, name: true, email: true, role: true },
  })
  if (!user) {
    cookieStore.delete(SESSION_COOKIE)
    if (redis) await redis.del(cacheKey)
    else sessionCache.delete(token)
    return null
  }

  if (redis) {
    await redis.setex(cacheKey, SESSION_TTL_SEC, JSON.stringify(user))
  } else {
    if (sessionCache.size >= MAX_SESSION_CACHE_SIZE) {
      const oldest = sessionCache.keys().next().value
      if (oldest) sessionCache.delete(oldest)
    }
    sessionCache.set(token, { user, expiry: Date.now() + SESSION_TTL_MS })
  }
  return user
}

export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getSession()
  return user?.role === 'admin' ? user : null
}
