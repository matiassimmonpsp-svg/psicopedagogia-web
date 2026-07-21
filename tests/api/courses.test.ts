import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    course: { findMany: vi.fn() },
    area: { findMany: vi.fn() },
    subarea: { findMany: vi.fn() },
  },
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { GET as coursesGET } from '@/app/api/courses/route'
import { prisma } from '@/lib/prisma'

describe('GET /api/courses', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns courses, areas and subareas', async () => {
    vi.mocked(prisma.course.findMany).mockResolvedValue([{ id: 1, name: '1° Básico', slug: '1-basico', sortOrder: 1, isActive: true }] as any)
    vi.mocked(prisma.area.findMany).mockResolvedValue([{ id: 1, name: 'Lectoescritura', slug: 'lectoescritura', sortOrder: 1, isActive: true }] as any)
    vi.mocked(prisma.subarea.findMany).mockResolvedValue([{ id: 1, areaId: 1, name: 'Conciencia Fonológica', slug: 'conciencia-fonologica', sortOrder: 1, isActive: true }] as any)
    const res = await coursesGET()
    const data = await res.json()
    expect(data.courses).toHaveLength(1)
    expect(data.areas).toHaveLength(1)
    expect(data.subareas).toHaveLength(1)
  })

  it('only returns active entities by default', async () => {
    vi.mocked(prisma.course.findMany).mockResolvedValue([])
    vi.mocked(prisma.area.findMany).mockResolvedValue([])
    vi.mocked(prisma.subarea.findMany).mockResolvedValue([])
    const res = await coursesGET()
    const data = await res.json()
    expect(prisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isActive: true },
    }))
    expect(data.courses).toEqual([])
  })
})
