import { prisma } from './prisma'
import { validatePassword, hashPassword, verifyPassword } from './auth-password'
import { signToken, verifyToken, SESSION_COOKIE, type AuthUser } from './auth-jwt'
import { getSession, blacklistToken, requireAdmin } from './auth-session'

export type { AuthUser }
export { validatePassword, hashPassword, verifyPassword, signToken, verifyToken, SESSION_COOKIE, getSession, blacklistToken, requireAdmin }

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

export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Correo o contraseña incorrectos')
  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new Error('Correo o contraseña incorrectos')
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}
