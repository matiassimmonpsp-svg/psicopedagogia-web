import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
