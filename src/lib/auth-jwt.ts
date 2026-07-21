import { SignJWT, jwtVerify } from 'jose'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

const JWT_SECRET_RAW = process.env.JWT_SECRET || ''
if (!JWT_SECRET_RAW || JWT_SECRET_RAW.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres. Genera con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"')
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW)

export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session'

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('60m')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}
