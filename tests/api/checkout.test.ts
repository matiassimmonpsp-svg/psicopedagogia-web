import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    resource: { findMany: vi.fn() },
    orderItem: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    order: {
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    discountCode: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((fns: any[]) => Promise.all(fns)),
  },
}))

vi.mock('@/lib/csrf', () => ({ csrfCheck: vi.fn().mockReturnValue(null) }))
vi.mock('@/lib/discount', () => ({ validateDiscountCode: vi.fn() }))

import { POST as checkoutPOST } from '@/app/api/checkout/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'
import * as discount from '@/lib/discount'

function makeReq(body?: Record<string, unknown>) {
  return {
    json: body ? () => Promise.resolve(body) : undefined,
    headers: new Headers({ 'content-type': 'application/json' }),
    method: 'POST',
    url: 'http://localhost:3000/api/checkout',
  } as any
}

const adminUser = { id: 'u1', name: 'Admin', email: 'a@b.cl', role: 'admin' }

// ============================================================
// POST /api/checkout
// ============================================================
describe('POST /api/checkout', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not authenticated', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const res = await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when cart is empty', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    const res = await checkoutPOST(makeReq({ items: [], paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('vacío')
  })

  it('returns 400 when resource no longer exists', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('ya no disponibles')
  })

  it('returns 400 when user already owns a resource', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([{ id: 'r1', priceClp: 5000, isActive: true }] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([{ resourceId: 'r1' }] as any)
    const res = await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('Ya posees')
  })

  it('returns 400 when a resource is paused (isActive=false)', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: true },
      { id: 'r2', priceClp: 3000, isActive: false },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    const res = await checkoutPOST(makeReq({ items: [{ id: 'r1' }, { id: 'r2' }], paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('no disponibles temporalmente')
  })

  it('returns 400 when all resources are paused', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: false },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    const res = await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated' }))
    expect(res.status).toBe(400)
  })

  it('creates order with active resources only', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'order1' } as any)
    vi.mocked(prisma.order.deleteMany).mockResolvedValue({ count: 0 } as any)
    const res = await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.orderId).toBe('order1')
  })

  it('uses price from DB, not from client', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'o1' } as any)
    vi.mocked(prisma.order.deleteMany).mockResolvedValue({ count: 0 } as any)
    await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated' }))
    const createCall = vi.mocked(prisma.order.create).mock.calls[0][0]
    expect(createCall.data.totalClp).toBe(5000)
  })

  it('applies discount code correctly', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 10000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(discount.validateDiscountCode).mockResolvedValue({ valid: true, discount: 2000 })
    vi.mocked(prisma.discountCode.findUnique).mockResolvedValue({ id: 'd1', maxUses: 100, usedCount: 0 } as any)
    vi.mocked(prisma.discountCode.updateMany).mockResolvedValue({ count: 1 } as any)
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'o1' } as any)
    vi.mocked(prisma.order.deleteMany).mockResolvedValue({ count: 0 } as any)
    await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated', discountCode: 'DESC20' }))
    const createCall = vi.mocked(prisma.order.create).mock.calls[0][0]
    expect(createCall.data.totalClp).toBe(8000)
  })

  it('returns 400 when discount code is invalid', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 10000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(discount.validateDiscountCode).mockResolvedValue({ valid: false, error: 'Código inválido' })
    const res = await checkoutPOST(makeReq({ items: [{ id: 'r1' }], paymentMethod: 'simulated', discountCode: 'BAD' }))
    expect(res.status).toBe(400)
  })
})
