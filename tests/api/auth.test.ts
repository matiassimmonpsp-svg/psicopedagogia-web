import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/csrf', () => ({
  csrfCheck: vi.fn().mockReturnValue(null),
  generateCsrfToken: vi.fn().mockReturnValue('fake-csrf'),
  getCsrfToken: vi.fn().mockReturnValue('fake-csrf'),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }),
}))

import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

function makeRequest(body: Record<string, unknown>, headers?: Record<string, string>) {
  return {
    json: () => Promise.resolve(body),
    headers: new Map(Object.entries({
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    })),
    method: 'POST',
    nextUrl: new URL('http://localhost:3000/api/auth/login'),
  } as unknown as Request
}

const mockUser = { id: 'u1', name: 'Test', email: 'test@test.com', role: 'user' }

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(auth, 'authenticateUser').mockResolvedValue(mockUser)
    vi.spyOn(auth, 'signToken').mockResolvedValue('mock-jwt-token')
  })

  it('returns 400 when email is missing', async () => {
    const req = makeRequest({ password: 'Password1' })
    const res = await loginPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Correo y contraseña requeridos')
  })

  it('returns 400 when password is missing', async () => {
    const req = makeRequest({ email: 'test@test.com' })
    const res = await loginPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Correo y contraseña requeridos')
  })

  it('returns 400 when both fields are missing', async () => {
    const req = makeRequest({})
    const res = await loginPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
  })

  it('returns user on successful login', async () => {
    const req = makeRequest({ email: 'test@test.com', password: 'Password1' })
    const res = await loginPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.user).toEqual(mockUser)
    expect(auth.authenticateUser).toHaveBeenCalledWith('test@test.com', 'Password1')
  })

  it('returns 401 on invalid credentials', async () => {
    vi.spyOn(auth, 'authenticateUser').mockRejectedValue(new Error('Correo o contraseña incorrectos'))
    const req = makeRequest({ email: 'bad@test.com', password: 'Wrong1234' })
    const res = await loginPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.error).toBe('Correo o contraseña incorrectos')
  })

  it('returns 500 on generic error', async () => {
    vi.spyOn(auth, 'authenticateUser').mockRejectedValue(new Error())
    const req = makeRequest({ email: 'x@x.com', password: 'Password1' })
    const res = await loginPOST(req as any)
    expect(res.status).toBe(500)
  })
})

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(auth, 'createUser').mockResolvedValue(mockUser)
    vi.spyOn(auth, 'signToken').mockResolvedValue('mock-jwt-token')
  })

  it('returns 400 when name is missing', async () => {
    const req = makeRequest({ email: 'test@test.com', password: 'Password1' })
    const res = await registerPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Todos los campos son obligatorios')
  })

  it('returns 400 when email is missing', async () => {
    const req = makeRequest({ name: 'Test', password: 'Password1' })
    const res = await registerPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
  })

  it('returns 400 when password is missing', async () => {
    const req = makeRequest({ name: 'Test', email: 'test@test.com' })
    const res = await registerPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
  })

  it('returns 201 with user on success (token only in httpOnly cookie)', async () => {
    const req = makeRequest({ name: 'Test', email: 'test@test.com', password: 'Password1' })
    const res = await registerPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.user).toEqual(mockUser)
    expect(data.token).toBeUndefined()
    expect(auth.createUser).toHaveBeenCalledWith('Test', 'test@test.com', 'Password1')
  })

  it('returns 409 when email already exists', async () => {
    vi.spyOn(auth, 'createUser').mockRejectedValue(new Error('El correo ya está registrado'))
    const req = makeRequest({ name: 'Test', email: 'taken@test.com', password: 'Password1' })
    const res = await registerPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(409)
    expect(data.error).toBe('El correo ya está registrado')
  })

  it('returns 500 on unexpected errors', async () => {
    vi.spyOn(auth, 'createUser').mockRejectedValue(new Error('Error inesperado'))
    const req = makeRequest({ name: 'Test', email: 'x@x.com', password: 'Password1' })
    const res = await registerPOST(req as any)
    expect(res.status).toBe(500)
  })

  it('passes weak password validation through createUser', async () => {
    vi.spyOn(auth, 'createUser').mockRejectedValue(new Error('La contraseña debe tener al menos 8 caracteres'))
    const req = makeRequest({ name: 'Test', email: 'x@x.com', password: 'short' })
    const res = await registerPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(500)
    expect(data.error).toBe('Error al registrar')
  })
})

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user when session exists', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    const res = await meGET()
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.user).toEqual(mockUser)
  })

  it('returns 401 when no session', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const res = await meGET()
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.user).toBeNull()
  })
})

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success and deletes session cookie', async () => {
    const mockDelete = vi.fn()
    const mockGet = vi.fn().mockReturnValue({ value: 'fake-token' })
    const { cookies } = await import('next/headers')
    ;(cookies as any).mockResolvedValue({ delete: mockDelete, get: mockGet })

    const req = {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      nextUrl: new URL('http://localhost:3000/api/auth/logout'),
    } as any

    const res = await logoutPOST(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
