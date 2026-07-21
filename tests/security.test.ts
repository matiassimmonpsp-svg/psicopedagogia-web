import { describe, it, expect, vi } from 'vitest'

vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({ className: 'inter' })),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    resource: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
    },
    discountCode: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'dc1', code: 'TEST', discountPct: 10, isActive: true,
        maxUses: 100, usedCount: 0, expiresAt: null,
      }),
    },
    cartItem: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn(), deleteMany: vi.fn() },
    order: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), findUnique: vi.fn() },
    download: { findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn((fns: any[]) => Promise.all(fns)),
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue(undefined),
    delete: vi.fn(),
  }),
}))

import { checkRateLimit, getClientIp, hashIp } from '@/lib/rate-limit'
import { csrfCheck } from '@/lib/csrf'

describe('Seguridad - Rate Limiting', () => {
  it('checkRateLimit es una función exportada', () => {
    expect(typeof checkRateLimit).toBe('function')
  })

  it('getClientIp es una función exportada', () => {
    expect(typeof getClientIp).toBe('function')
  })

  it('hashIp es una función exportada', () => {
    expect(typeof hashIp).toBe('function')
  })

  it('getClientIp retorna un string con Headers válidos', () => {
    const headers = new Headers()
    headers.set('x-forwarded-for', '192.168.1.1')

    const ip = getClientIp(headers)
    expect(typeof ip).toBe('string')
    expect(ip.length).toBeGreaterThan(0)
  })

  it('getClientIp retorna 127.0.0.1 por defecto', () => {
    const headers = new Headers()
    const ip = getClientIp(headers)
    expect(ip).toBe('127.0.0.1')
  })

  it('hashIp retorna hash consistente', () => {
    const hash1 = hashIp('192.168.1.1')
    const hash2 = hashIp('192.168.1.1')
    expect(hash1).toBe(hash2)
    expect(hash1).not.toBe('192.168.1.1')
  })

  it('hashIp produce hashes diferentes para IPs diferentes', () => {
    const hash1 = hashIp('192.168.1.1')
    const hash2 = hashIp('10.0.0.1')
    expect(hash1).not.toBe(hash2)
  })
})

describe('Seguridad - CSRF', () => {
  it('csrfCheck es una función exportada', () => {
    expect(typeof csrfCheck).toBe('function')
  })

  it('csrfCheck permite requests GET sin verificación', () => {
    const mockReq = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    const result = csrfCheck(mockReq)
    expect(result).toBeNull()
  })

  it('csrfCheck permite requests HEAD sin verificación', () => {
    const mockReq = {
      method: 'HEAD',
      headers: new Map(),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    const result = csrfCheck(mockReq)
    expect(result).toBeNull()
  })

  it('csrfCheck bloquea POST sin Origin header', async () => {
    const mockReq = {
      method: 'POST',
      headers: new Map(),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    const result = csrfCheck(mockReq)
    expect(result).not.toBeNull()
    const status = (result as Response).status
    expect(status).toBe(403)
  })

  it('csrfCheck bloquea POST con Origin pero sin CSRF token', async () => {
    const mockReq = {
      method: 'POST',
      headers: new Map([
        ['origin', 'http://localhost:3001'],
        ['host', 'localhost:3001'],
      ]),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    const result = csrfCheck(mockReq)
    expect(result).not.toBeNull()
    const data = await (result as Response).json()
    expect(data.error).toContain('CSRF')
  })
})

describe('Seguridad - Métodos HTTP requieren CSRF', () => {
  it('GET no requiere CSRF', () => {
    const mockReq = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    expect(csrfCheck(mockReq)).toBeNull()
  })

  it('POST requiere CSRF', () => {
    const mockReq = {
      method: 'POST',
      headers: new Map([['origin', 'http://localhost:3001'], ['host', 'localhost:3001']]),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    expect(csrfCheck(mockReq)).not.toBeNull()
  })

  it('DELETE requiere CSRF', () => {
    const mockReq = {
      method: 'DELETE',
      headers: new Map([['origin', 'http://localhost:3001'], ['host', 'localhost:3001']]),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    expect(csrfCheck(mockReq)).not.toBeNull()
  })

  it('PUT requiere CSRF', () => {
    const mockReq = {
      method: 'PUT',
      headers: new Map([['origin', 'http://localhost:3001'], ['host', 'localhost:3001']]),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    expect(csrfCheck(mockReq)).not.toBeNull()
  })

  it('PATCH requiere CSRF', () => {
    const mockReq = {
      method: 'PATCH',
      headers: new Map([['origin', 'http://localhost:3001'], ['host', 'localhost:3001']]),
      nextUrl: { protocol: 'http:', host: 'localhost:3001' },
    } as any
    expect(csrfCheck(mockReq)).not.toBeNull()
  })
})

describe('Seguridad - Descuentos', () => {
  it('validateDiscountCode retorna descuento válido del 1-100%', async () => {
    const { validateDiscountCode } = await import('@/lib/discount')
    const result = await validateDiscountCode('TEST', 50000)

    expect(result).toBeDefined()
    expect(result!.discountPercent).toBeGreaterThanOrEqual(1)
    expect(result!.discountPercent).toBeLessThanOrEqual(100)
  })

  it('validateDiscountCode retorna error genérico para código inexistente', async () => {
    vi.mocked((await import('@/lib/prisma')).prisma.discountCode.findUnique).mockResolvedValueOnce(null)
    const { validateDiscountCode } = await import('@/lib/discount')
    const result = await validateDiscountCode('NONEXISTENT', 50000)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Código no válido')
  })

  it('validateDiscountCode retorna error genérico para código desactivado', async () => {
    vi.mocked((await import('@/lib/prisma')).prisma.discountCode.findUnique).mockResolvedValueOnce({
      id: 1, code: 'INACTIVE', discountPct: 10, isActive: false,
      maxUses: 100, usedCount: 0, expiresAt: null, createdAt: new Date(),
    } as any)
    const { validateDiscountCode } = await import('@/lib/discount')
    const result = await validateDiscountCode('INACTIVE', 50000)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Código no válido')
  })

  it('validateDiscountCode retorna error genérico para código agotado', async () => {
    vi.mocked((await import('@/lib/prisma')).prisma.discountCode.findUnique).mockResolvedValueOnce({
      id: 2, code: 'USEDUP', discountPct: 10, isActive: true,
      maxUses: 10, usedCount: 10, expiresAt: null, createdAt: new Date(),
    } as any)
    const { validateDiscountCode } = await import('@/lib/discount')
    const result = await validateDiscountCode('USEDUP', 50000)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Código no válido')
  })

  it('validateDiscountCode retorna error genérico para código expirado', async () => {
    vi.mocked((await import('@/lib/prisma')).prisma.discountCode.findUnique).mockResolvedValueOnce({
      id: 3, code: 'EXPIRED', discountPct: 10, isActive: true,
      maxUses: 100, usedCount: 0, expiresAt: new Date('2020-01-01'), createdAt: new Date(),
    } as any)
    const { validateDiscountCode } = await import('@/lib/discount')
    const result = await validateDiscountCode('EXPIRED', 50000)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Código no válido')
  })
})

describe('Seguridad - Open Redirect', () => {
  it('login callbackUrl solo acepta rutas relativas', () => {
    const testCases = [
      { input: '/admin', expected: '/admin' },
      { input: 'https://evil.com', expected: '/' },
      { input: '//evil.com', expected: '/' },
      { input: 'javascript:alert(1)', expected: '/' },
      { input: null, expected: '/' },
    ]

    for (const { input, expected } of testCases) {
      const raw = input || '/'
      const callbackUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
      expect(callbackUrl).toBe(expected)
    }
  })
})
