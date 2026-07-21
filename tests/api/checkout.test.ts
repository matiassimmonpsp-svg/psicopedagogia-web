import { describe, it, expect, vi, beforeEach } from 'vitest'

const txMocks = {
  order: {
    create: vi.fn().mockResolvedValue({ id: 'order1' }),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    findFirst: vi.fn().mockResolvedValue(null),
  },
  discountCode: {
    findUnique: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
}

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
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(async (fn: any) => fn(txMocks)),
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

function mockCart(resourceIds: string[]) {
  if (resourceIds.length === 0) {
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null as any)
  } else {
    vi.mocked(prisma.order.findFirst).mockResolvedValue({
      id: 'cart1',
      items: resourceIds.map(id => ({ resourceId: id, priceClp: 0 })),
    } as any)
  }
}

// ============================================================
// POST /api/checkout
// ============================================================
describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    txMocks.order.create.mockReset()
    txMocks.order.create.mockResolvedValue({ id: 'order1' })
    txMocks.order.deleteMany.mockReset()
    txMocks.order.deleteMany.mockResolvedValue({ count: 0 })
    txMocks.order.findFirst.mockReset()
    txMocks.order.findFirst.mockResolvedValue(null)
    txMocks.discountCode.findUnique.mockReset()
    txMocks.discountCode.update.mockReset()
    txMocks.discountCode.update.mockResolvedValue({})
    vi.mocked(prisma.discountCode.findUnique).mockReset()
    vi.mocked(prisma.discountCode.findUnique).mockResolvedValue(null as any)
  })

  it('returns 401 when not authenticated', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when cart is empty', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart([])
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('vacío')
  })

  it('returns 400 when resource no longer exists', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('no están disponibles')
  })

  it('returns 400 when user already owns a resource', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([{ id: 'r1', priceClp: 5000, isActive: true }] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([{ resourceId: 'r1' }] as any)
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('Ya posees')
  })

  it('returns 400 when a resource is paused (isActive=false)', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1', 'r2'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: true },
      { id: 'r2', priceClp: 3000, isActive: false },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('no están disponibles temporalmente')
  })

  it('returns 400 when all resources are paused', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: false },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    expect(res.status).toBe(400)
  })

  it('creates order with active resources only', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    txMocks.order.create.mockResolvedValue({ id: 'order1' } as any)
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.orderId).toBe('order1')
  })

  it('uses price from DB, not from client', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 5000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    await checkoutPOST(makeReq({ paymentMethod: 'simulated' }))
    const createCall = txMocks.order.create.mock.calls[0][0]
    expect(createCall.data.totalClp).toBe(5000)
  })

  it('applies discount code correctly', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 10000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(discount.validateDiscountCode).mockResolvedValue({ valid: true, discount: 2000 })
    vi.mocked(prisma.discountCode.findUnique).mockResolvedValue({ id: 'd1', maxUses: 100, usedCount: 0 } as any)
    txMocks.discountCode.findUnique.mockResolvedValue({ id: 'd1', maxUses: 100, usedCount: 0 } as any)
    await checkoutPOST(makeReq({ paymentMethod: 'simulated', discountCode: 'DESC20' }))
    const createCall = txMocks.order.create.mock.calls[0][0]
    expect(createCall.data.totalClp).toBe(8000)
  })

  it('returns 400 when discount code is invalid', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(adminUser as any)
    mockCart(['r1'])
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', priceClp: 10000, isActive: true },
    ] as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(discount.validateDiscountCode).mockResolvedValue({ valid: false, error: 'Código inválido' })
    const res = await checkoutPOST(makeReq({ paymentMethod: 'simulated', discountCode: 'BAD' }))
    expect(res.status).toBe(400)
  })
})
