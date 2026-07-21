import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: { findMany: vi.fn() },
  },
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { GET as tagsGET } from '@/app/api/tags/route'
import { prisma } from '@/lib/prisma'

describe('GET /api/tags', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns tags list', async () => {
    vi.mocked(prisma.tag.findMany).mockResolvedValue([
      { id: 1, name: 'atención', slug: 'atencion' },
      { id: 2, name: 'memoria', slug: 'memoria' },
    ] as any)
    const res = await tagsGET()
    const data = await res.json()
    expect(data.tags).toHaveLength(2)
    expect(data.tags[0].name).toBe('atención')
  })

  it('returns empty list when no tags', async () => {
    vi.mocked(prisma.tag.findMany).mockResolvedValue([])
    const res = await tagsGET()
    const data = await res.json()
    expect(data.tags).toEqual([])
  })
})
