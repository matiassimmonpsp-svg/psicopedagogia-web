import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno')
}
const SALT_ROUNDS = 10

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function createUser(name: string, email: string, password: string): Promise<AuthUser> {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('El correo ya está registrado')
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'user' },
  })

  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getSession()
  if (!user || user.role !== 'admin') return null
  return user
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Correo o contraseña incorrectos')
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    throw new Error('Correo o contraseña incorrectos')
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role }
}
