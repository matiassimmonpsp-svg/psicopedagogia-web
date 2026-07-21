import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    discountCode: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
vi.mock('@/lib/csrf', () => ({ csrfCheck: vi.fn().mockReturnValue(null) }))
vi.mock('@/lib/discount', () => ({ validateDiscountCode: vi.fn() }))
vi.mock('@/lib/api-helpers', async (importOriginal) => {
  const original = await importOriginal() as Record<string, unknown>
  return {
    ...original,
    enforceRateLimit: vi.fn().mockResolvedValue(null),
  }
})

import { GET as codesGET, POST as codesPOST } from '@/app/api/discount-codes/route'
import { GET as codeGET, PUT as codePUT, DELETE as codeDELETE } from '@/app/api/discount-codes/[id]/route'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'
import { validateDiscountCode } from '@/lib/discount'
import * as auth from '@/lib/auth'

const adminUser = { id: 'a1', name: 'Admin', email: 'a@b.cl', role: 'admin' }

function makeReq(body?: Record<string, unknown>, method = 'GET') {
  return {
    json: body ? () => Promise.resolve(body) : undefined,
    headers: new Headers({ 'content-type': 'application/json' }),
    method,
    url: 'http://localhost:3000/api/discount-codes',
  } as any
}

describe('GET /api/discount-codes', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await codesGET()
    expect(res.status).toBe(401)
  })

  it('returns codes list', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.discountCode.findMany).mockResolvedValue([
      { id: 1, code: 'WELCOME10', discountPct: 10, usedCount: 0, maxUses: 100, isActive: true, createdAt: new Date() },
    ] as any)
    const res = await codesGET()
    const data = await res.json()
    expect(data.codes).toHaveLength(1)
  })
})

describe('POST /api/discount-codes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(csrfCheck).mockReturnValue(null)
  })

  it('verifies a valid discount code', async () => {
    vi.mocked(validateDiscountCode).mockResolvedValue({ valid: true, discount: 500, discountCodeId: 1 })
    const res = await codesPOST(makeReq({ action: 'verify', code: 'WELCOME10', cartTotal: 5000 }, 'POST'))
    const data = await res.json()
    expect(data.valid).toBe(true)
  })

  it('returns error for invalid code', async () => {
    vi.mocked(validateDiscountCode).mockResolvedValue({ valid: false, error: 'Código inválido' })
    const res = await codesPOST(makeReq({ action: 'verify', code: 'INVALID', cartTotal: 5000 }, 'POST'))
    expect(res.status).toBe(400)
  })

  it('creates code as admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.discountCode.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.discountCode.create).mockResolvedValue({ id: 1, code: 'NEW10', discountPct: 10 } as any)
    const res = await codesPOST(makeReq({ code: 'NEW10', discountPercent: 10 }, 'POST'))
    expect(res.status).toBe(201)
  })
})

describe('GET /api/discount-codes/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await codeGET(makeReq(), { params: { id: '1' } })
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid id', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await codeGET(makeReq(), { params: { id: 'abc' } })
    expect(res.status).toBe(400)
  })

  it('returns code by id', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.discountCode.findUnique).mockResolvedValue({ id: 1, code: 'WELCOME10', discountPct: 10 } as any)
    const res = await codeGET(makeReq(), { params: { id: '1' } })
    const data = await res.json()
    expect(data.code.code).toBe('WELCOME10')
  })
})

describe('PUT /api/discount-codes/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(csrfCheck).mockReturnValue(null)
  })

  it('returns 400 for invalid id', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await codePUT(makeReq({ discountPercent: 20 }, 'PUT'), { params: { id: 'abc' } })
    expect(res.status).toBe(400)
  })

  it('updates discount percentage', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.discountCode.update).mockResolvedValue({ id: 1, code: 'TEST', discountPct: 20 } as any)
    const res = await codePUT(makeReq({ discountPercent: 20 }, 'PUT'), { params: { id: '1' } })
    const data = await res.json()
    expect(data.code.discountPct).toBe(20)
  })
})

describe('DELETE /api/discount-codes/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(csrfCheck).mockReturnValue(null)
  })

  it('returns 400 for invalid id', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await codeDELETE(makeReq({}, 'DELETE'), { params: { id: 'abc' } })
    expect(res.status).toBe(400)
  })

  it('deletes code', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.discountCode.delete).mockResolvedValue({} as any)
    const res = await codeDELETE(makeReq({}, 'DELETE'), { params: { id: '1' } })
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
