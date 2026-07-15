import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set JWT_SECRET BEFORE imports
Object.assign(process.env, { JWT_SECRET: 'test-secret-key-for-testing-minimum-32-chars-long!!' })

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'test-token' }),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  })),
}))

import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

describe('lib/auth - unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validatePassword', () => {
    it('returns null for valid password', () => {
      expect(auth.validatePassword('Password1')).toBeNull()
      expect(auth.validatePassword('Test1234')).toBeNull()
      expect(auth.validatePassword('Aa123456')).toBeNull()
    })

    it('rejects password shorter than 8 chars', () => {
      expect(auth.validatePassword('Pass1')).toBe('La contraseña debe tener al menos 8 caracteres')
    })

    it('rejects password longer than 128 chars', () => {
      const long = 'A'.repeat(129) + 'a1'
      expect(auth.validatePassword(long)).toBe('La contraseña es demasiado larga (máximo 128 caracteres)')
    })

    it('rejects missing uppercase', () => {
      expect(auth.validatePassword('password1')).toBe('La contraseña debe contener al menos una mayúscula')
    })

    it('rejects missing lowercase', () => {
      expect(auth.validatePassword('PASSWORD1')).toBe('La contraseña debe contener al menos una minúscula')
    })

    it('rejects missing number', () => {
      expect(auth.validatePassword('Password')).toBe('La contraseña debe contener al menos un número')
    })

    it('rejects empty', () => {
      expect(auth.validatePassword('')).toBe('La contraseña debe tener al menos 8 caracteres')
      expect(auth.validatePassword(null as any)).toBe('La contraseña debe tener al menos 8 caracteres')
    })
  })

  describe('hashPassword / verifyPassword', () => {
    it('hashes and verifies correctly', async () => {
      const plain = 'TestPass123'
      const hash = await auth.hashPassword(plain)
      expect(hash).not.toBe(plain)
      expect(await auth.verifyPassword(plain, hash)).toBe(true)
      expect(await auth.verifyPassword('Wrong123', hash)).toBe(false)
    })
  })

  describe('signToken / verifyToken - basic', () => {
    it('returns null for invalid token', async () => {
      expect(await auth.verifyToken('invalid.token.here')).toBeNull()
      expect(await auth.verifyToken('')).toBeNull()
    })
  })

  describe('createUser', () => {
    beforeEach(() => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'u1', name: 'Test', email: 'test@test.com', passwordHash: 'hash', role: 'user',
        avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      } as any)
    })

    it('creates user with valid data', async () => {
      const user = await auth.createUser('Test', 'test@test.com', 'Password1')
      expect(user).toEqual({ id: 'u1', name: 'Test', email: 'test@test.com', role: 'user' })
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'Test', email: 'test@test.com', passwordHash: expect.any(String), role: 'user' },
      })
    })

    it('throws if password invalid', async () => {
      await expect(auth.createUser('Test', 'test@test.com', 'weak')).rejects.toThrow('8 caracteres')
    })

    it('throws if email exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as any)
      await expect(auth.createUser('Test', 'taken@test.com', 'Password1')).rejects.toThrow('ya está registrado')
    })
  })

  describe('authenticateUser', () => {
    it('returns user on valid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1', name: 'Test', email: 'test@test.com', passwordHash: await auth.hashPassword('Password1'), role: 'user',
      } as any)

      const user = await auth.authenticateUser('test@test.com', 'Password1')
      expect(user).toEqual({ id: 'u1', name: 'Test', email: 'test@test.com', role: 'user' })
    })

    it('throws if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      await expect(auth.authenticateUser('missing@test.com', 'Password1')).rejects.toThrow('Correo o contraseña incorrectos')
    })

    it('throws if password wrong', async () => {
      const hash = await auth.hashPassword('Password1')
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1', name: 'Test', email: 'test@test.com', passwordHash: hash, role: 'user',
      } as any)

      await expect(auth.authenticateUser('test@test.com', 'Wrong123')).rejects.toThrow('Correo o contraseña incorrectos')
    })
  })

  describe('requireAdmin', () => {
    it('returns null if user', async () => {
      // Mock getSession to return user role
      vi.spyOn(auth, 'getSession').mockResolvedValue({ id: 'u1', name: 'User', email: 'user@test.com', role: 'user' })
      const user = await auth.requireAdmin()
      expect(user).toBeNull()
    })

    it('returns null if no session', async () => {
      vi.spyOn(auth, 'getSession').mockResolvedValue(null)
      const user = await auth.requireAdmin()
      expect(user).toBeNull()
    })
  })

  describe('getSession', () => {
    it('returns null if no cookie', async () => {
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) } as any)
      const session = await auth.getSession()
      expect(session).toBeNull()
    })
  })
})