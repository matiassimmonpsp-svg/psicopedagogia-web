import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { Redis } from '@upstash/redis'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
if (!JWT_SECRET) throw new Error('JWT_SECRET no definido en .env')

const SALT_ROUNDS = 10

/** Valida que la contraseña cumpla requisitos mínimos de seguridad */
export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres'
  }
  if (password.length > 128) {
    return 'La contraseña es demasiado larga (máximo 128 caracteres)'
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula'
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una minúscula'
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un número'
  }
  return null
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

/** Hashea una contraseña con bcrypt */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/** Compara contraseña con su hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/** Genera un JWT con los datos del usuario (expira en 7 días) */
export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

/** Verifica y decodifica un JWT */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}

/** Cache de sesiones en memoria (fallback si no hay Redis) */
const sessionCache = new Map<string, { user: AuthUser; expiry: number }>()
const SESSION_TTL_MS = 30_000

/** Cliente Redis opcional para cache de sesiones (Upstash / Vercel KV) */
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

/**
 * Obtiene el usuario autenticado desde la cookie 'session'.
 * Usa Redis (30s TTL) si está configurado; si no, Map en memoria.
 * Evita queries repetidas a la BD en requests consecutivos.
 */
export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  const cacheKey = `session:${token}`

  // 1. Intenta Redis
  if (redis) {
    const cached = await redis.get<string>(cacheKey)
    if (cached) return JSON.parse(cached)
  }

  // 2. Fallback: memoria local
  const mem = sessionCache.get(token)
  if (mem && mem.expiry > Date.now()) return mem.user

  // 3. Verifica token y busca en BD
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
    cookieStore.delete('session')
    if (redis) await redis.del(cacheKey)
    else sessionCache.delete(token)
    return null
  }

  // Guarda en cache
  if (redis) {
    await redis.setex(cacheKey, SESSION_TTL_SEC, JSON.stringify(user))
  } else {
    sessionCache.set(token, { user, expiry: Date.now() + SESSION_TTL_MS })
  }
  return user
}

/** Crea un nuevo usuario en la BD */
export async function createUser(name: string, email: string, password: string): Promise<AuthUser> {
  const passwordError = validatePassword(password)
  if (passwordError) throw new Error(passwordError)

  const existente = await prisma.user.findUnique({ where: { email } })
  if (existente) throw new Error('El correo ya está registrado')

  const hash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hash, role: 'user' },
  })
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

/** Valida credenciales y devuelve el usuario */
export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Correo o contraseña incorrectos')
  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new Error('Correo o contraseña incorrectos')
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

/** Requiere rol admin; devuelve null si no cumple */
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getSession()
  return user?.role === 'admin' ? user : null
}