import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRequireSession = vi.hoisted(() => vi.fn())

vi.mock('@/lib/prisma', () => ({
  prisma: {
    orderItem: { findMany: vi.fn() },
    download: { findMany: vi.fn() },
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

import { GET as downloadsGET } from '@/app/api/downloads/route'
import { prisma } from '@/lib/prisma'

function mockRequest() {
  return new Request('http://localhost:3001/api/downloads')
}

describe('GET /api/downloads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireSession.mockResolvedValue({ id: 'u1', name: 'User', email: 'u@b.cl', role: 'user' })
  })

  it('returns 401 when not authenticated', async () => {
    const { NextResponse } = await import('next/server')
    mockRequireSession.mockResolvedValue(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
    const res = await downloadsGET(mockRequest())
    expect(res.status).toBe(401)
  })

  it('returns empty downloads when user has none', async () => {
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(prisma.download.findMany).mockResolvedValue([])
    const res = await downloadsGET(mockRequest())
    const data = await res.json()
    expect(data.downloads).toEqual([])
  })

  it('includes isActive field for purchased resources', async () => {
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([{
      id: 'oi1', resourceId: 'r1', priceClp: 5000,
      resource: { id: 'r1', title: 'Test', isFree: false, resourceType: 'evaluation', courseId: 1, areaId: 1, isActive: false, course: { name: 'Prekínder', slug: 'prekinder' }, area: { slug: 'lectoescritura' } },
      order: { createdAt: new Date('2025-01-01') },
    }] as any)
    vi.mocked(prisma.download.findMany).mockResolvedValue([])
    const res = await downloadsGET(mockRequest())
    const data = await res.json()
    expect(data.downloads[0].isActive).toBe(false)
  })

  it('includes isActive field for free resources', async () => {
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    vi.mocked(prisma.download.findMany).mockResolvedValue([{
      id: 'd1', resourceId: 'r2', downloadedAt: new Date('2025-01-01'),
      resource: { id: 'r2', title: 'Free', isFree: true, resourceType: 'educational', courseId: 1, areaId: 1, isActive: true, course: { name: 'Kinder', slug: 'kinder' }, area: { slug: 'matematica' } },
    }] as any)
    const res = await downloadsGET(mockRequest())
    const data = await res.json()
    expect(data.downloads[0].isActive).toBe(true)
  })

  it('deduplicates purchased and free resources', async () => {
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([{
      id: 'oi1', resourceId: 'r1', priceClp: 5000,
      resource: { id: 'r1', title: 'Test', isFree: false, resourceType: 'evaluation', courseId: 1, areaId: 1, isActive: true, course: { name: 'A', slug: 'a' }, area: { slug: 'b' } },
      order: { createdAt: new Date('2025-01-01') },
    }] as any)
    vi.mocked(prisma.download.findMany).mockResolvedValue([{
      id: 'd1', resourceId: 'r1', downloadedAt: new Date('2025-01-02'),
      resource: { id: 'r1', title: 'Test', isFree: true, resourceType: 'evaluation', courseId: 1, areaId: 1, isActive: true, course: { name: 'A', slug: 'a' }, area: { slug: 'b' } },
    }] as any)
    const res = await downloadsGET(mockRequest())
    const data = await res.json()
    expect(data.downloads).toHaveLength(1)
  })
})
