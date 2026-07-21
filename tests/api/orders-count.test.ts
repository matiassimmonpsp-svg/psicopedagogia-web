import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

const mockRequireSession = vi.hoisted(() => vi.fn())

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: { count: vi.fn() },
  },
}))
vi.mock('@/lib/api-helpers', async (importOriginal) => {
  const original = await importOriginal() as Record<string, unknown>
  return {
    ...original,
    enforceRateLimit: vi.fn().mockResolvedValue(null),
    requireSession: (...args: unknown[]) => mockRequireSession(...args),
  }
})

import { GET as ordersCountGET } from '@/app/api/orders/count/route'
import { prisma } from '@/lib/prisma'

describe('GET /api/orders/count', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not authenticated', async () => {
    mockRequireSession.mockResolvedValue(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
    const res = await ordersCountGET()
    expect(res.status).toBe(401)
  })

  it('returns order count', async () => {
    mockRequireSession.mockResolvedValue({ id: 'u1', name: 'User', email: 'u@b.cl', role: 'user' })
    vi.mocked(prisma.order.count).mockResolvedValue(5)
    const res = await ordersCountGET()
    const data = await res.json()
    expect(data.count).toBe(5)
  })
})
