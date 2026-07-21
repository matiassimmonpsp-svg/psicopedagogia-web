import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetSession = vi.hoisted(() => vi.fn())

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: { findMany: vi.fn() },
  },
}))
vi.mock('@/lib/api-helpers', async (importOriginal) => {
  const original = await importOriginal() as Record<string, unknown>
  return {
    ...original,
    enforceRateLimit: vi.fn().mockResolvedValue(null),
  }
})
vi.mock('@/lib/auth', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}))

import { GET as homeGET } from '@/app/api/home-featured/route'
import { prisma } from '@/lib/prisma'

function mockRequest() {
  return new Request('http://localhost:3001/api/home-featured')
}

describe('GET /api/home-featured', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns free and premium resources for admin (bypasses cache)', async () => {
    mockGetSession.mockResolvedValue({ id: 'a1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.resource.findMany).mockResolvedValueOnce([
      { id: 'r1', title: 'Free', isFree: true, downloadsCount: 10, tags: [], course: { name: 'A', slug: 'a' }, area: { name: 'B', slug: 'b' }, subarea: null, previewPath: '' } as any,
    ])
    vi.mocked(prisma.resource.findMany).mockResolvedValueOnce([
      { id: 'r2', title: 'Premium', isFree: false, downloadsCount: 5, tags: [], course: { name: 'C', slug: 'c' }, area: { name: 'D', slug: 'd' }, subarea: null, previewPath: '' } as any,
    ])
    const res = await homeGET(mockRequest())
    const data = await res.json()
    expect(data.free).toHaveLength(1)
    expect(data.premium).toHaveLength(1)
    expect(data.free[0].title).toBe('Free')
    expect(data.premium[0].title).toBe('Premium')
  })

  it('returns 500 on db error', async () => {
    mockGetSession.mockResolvedValue({ id: 'a1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.resource.findMany).mockRejectedValue(new Error('DB fail'))
    const res = await homeGET(mockRequest())
    expect(res.status).toBe(500)
  })
})
