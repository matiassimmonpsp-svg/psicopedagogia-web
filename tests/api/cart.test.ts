import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/csrf', () => ({
  csrfCheck: vi.fn().mockReturnValue(null),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue(undefined),
    delete: vi.fn(),
  }),
}))

import { GET as cartGET, POST as cartPOST } from '@/app/api/cart/route'
import { DELETE as cartItemDELETE } from '@/app/api/cart/[resourceId]/route'
import { DELETE as cartClearDELETE } from '@/app/api/cart/clear/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'
import { csrfCheck } from '@/lib/csrf'

function makeCartRequest(body?: Record<string, unknown>, method = 'GET') {
  return {
    json: body ? () => Promise.resolve(body) : undefined,
    headers: new Map([['x-forwarded-for', '127.0.0.1']]),
    method,
    nextUrl: new URL('http://localhost:3000/api/cart'),
  } as unknown as Request
}

const mockUser = { id: 'u1', name: 'Test', email: 'test@test.com', role: 'user' }

describe('GET /api/cart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty items when not authenticated', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const res = await cartGET()
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.items).toEqual([])
  })

  it('returns cart items for authenticated user', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({
      id: 'o1',
      userId: 'u1',
      totalClp: 5990,
      status: 'cart',
      items: [
        {
          resourceId: 'r1',
          priceClp: 5990,
          resource: { title: 'Test Resource', course: { name: 'Prekínder' } },
        },
      ],
    } as any)

    const res = await cartGET()
    const data = await res.json()
    expect(data.items).toHaveLength(1)
    expect(data.items[0].id).toBe('r1')
    expect(data.items[0].title).toBe('Test Resource')
    expect(data.items[0].priceClp).toBe(5990)
    expect(data.items[0].courseName).toBe('Prekínder')
  })

  it('returns empty items when user has no cart order', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null)

    const res = await cartGET()
    const data = await res.json()
    expect(data.items).toEqual([])
  })

  it('returns empty items when order has no items', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({
      id: 'o1',
      userId: 'u1',
      totalClp: 0,
      status: 'cart',
      items: [],
    } as any)

    const res = await cartGET()
    const data = await res.json()
    expect(data.items).toEqual([])
  })
})

describe('POST /api/cart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(csrfCheck).mockReturnValue(null)
  })

  it('returns 401 when not authenticated', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const req = makeCartRequest({ resourceId: 'r1', priceClp: 5000 }, 'POST')
    const res = await cartPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.error).toBe('No autorizado')
  })

  it('returns 400 when resourceId is missing', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    const req = makeCartRequest({ priceClp: 5000 }, 'POST')
    const res = await cartPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Faltan datos')
  })

  it('returns 400 when priceClp is missing', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    const req = makeCartRequest({ resourceId: 'r1' }, 'POST')
    const res = await cartPOST(req as any)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Faltan datos')
  })

  it('creates new order when user has no cart', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'new-o1', totalClp: 0, status: 'cart' } as any)
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.orderItem.create).mockResolvedValue({} as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([{ priceClp: 5000 }] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const req = makeCartRequest({ resourceId: 'r1', priceClp: 5000 }, 'POST')
    const res = await cartPOST(req as any)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(prisma.order.create).toHaveBeenCalled()
  })

  it('adds item to existing order', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o1', totalClp: 0, status: 'cart' } as any)
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.orderItem.create).mockResolvedValue({} as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([{ priceClp: 5000 }] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const req = makeCartRequest({ resourceId: 'r1', priceClp: 5000 }, 'POST')
    const res = await cartPOST(req as any)
    expect(res.status).toBe(200)
    expect(prisma.orderItem.create).toHaveBeenCalled()
  })

  it('returns message when item already in cart', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o1', totalClp: 5000, status: 'cart' } as any)
    /* Mock findFirst: null para ownership check, resultado para duplicate check */
    vi.mocked(prisma.orderItem.findFirst).mockImplementation(async (args: any) => {
      if (args?.where?.order) return null  /* ownership check */
      return { id: 1, resourceId: 'r1' } as any  /* duplicate check */
    })

    const req = makeCartRequest({ resourceId: 'r1', priceClp: 5000 }, 'POST')
    const res = await cartPOST(req as any)
    const data = await res.json()
    expect(data.message).toBe('Ya está en el carrito')
  })

  it('updates total after adding item', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o1', totalClp: 0, status: 'cart' } as any)
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.orderItem.create).mockResolvedValue({} as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([
      { priceClp: 3000 },
      { priceClp: 5000 },
    ] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const req = makeCartRequest({ resourceId: 'r1', priceClp: 5000 }, 'POST')
    await cartPOST(req as any)
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { totalClp: 8000 },
    })
  })

  it('blocks request when CSRF check fails', async () => {
    vi.mocked(csrfCheck).mockReturnValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) as any
    )
    const req = makeCartRequest({ resourceId: 'r1', priceClp: 5000 }, 'POST')
    const res = await cartPOST(req as any)
    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/cart/[resourceId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(csrfCheck).mockReturnValue(null)
  })

  it('returns 401 when not authenticated', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartItemDELETE(req as any, { params: { resourceId: 'r1' } })
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.error).toBe('No autorizado')
  })

  it('returns 404 when cart is empty', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null)
    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartItemDELETE(req as any, { params: { resourceId: 'r1' } })
    const data = await res.json()
    expect(res.status).toBe(404)
    expect(data.error).toBe('Carrito vacío')
  })

  it('removes item and recalculates total', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o1', totalClp: 8000, status: 'cart' } as any)
    vi.mocked(prisma.orderItem.deleteMany).mockResolvedValue({ count: 1 } as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([{ priceClp: 3000 }] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartItemDELETE(req as any, { params: { resourceId: 'r1' } })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(prisma.orderItem.deleteMany).toHaveBeenCalledWith({
      where: { orderId: 'o1', resourceId: 'r1' },
    })
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { totalClp: 3000 },
    })
  })

  it('sets total to 0 when all items removed', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o1', totalClp: 5000, status: 'cart' } as any)
    vi.mocked(prisma.orderItem.deleteMany).mockResolvedValue({ count: 1 } as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const req = makeCartRequest(undefined, 'DELETE')
    await cartItemDELETE(req as any, { params: { resourceId: 'r1' } })
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { totalClp: 0 },
    })
  })

  it('blocks request when CSRF check fails', async () => {
    vi.mocked(csrfCheck).mockReturnValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) as any
    )
    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartItemDELETE(req as any, { params: { resourceId: 'r1' } })
    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/cart/clear', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(csrfCheck).mockReturnValue(null)
  })

  it('returns 401 when not authenticated', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartClearDELETE(req as any)
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.error).toBe('No autorizado')
  })

  it('returns success when cart is already empty', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null)
    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartClearDELETE(req as any)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('clears all items and resets total', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(mockUser)
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o1', totalClp: 10000, status: 'cart' } as any)
    vi.mocked(prisma.orderItem.deleteMany).mockResolvedValue({ count: 3 } as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartClearDELETE(req as any)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(prisma.orderItem.deleteMany).toHaveBeenCalledWith({ where: { orderId: 'o1' } })
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { totalClp: 0 },
    })
  })

  it('blocks request when CSRF check fails', async () => {
    vi.mocked(csrfCheck).mockReturnValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) as any
    )
    const req = makeCartRequest(undefined, 'DELETE')
    const res = await cartClearDELETE(req as any)
    expect(res.status).toBe(403)
  })
})
