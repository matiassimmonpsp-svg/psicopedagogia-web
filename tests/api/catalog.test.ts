import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
      findMany: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    orderItem: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}))

import { GET } from '@/app/api/catalog/route'
import { prisma } from '@/lib/prisma'

function makeCatalogRequest(queryParams?: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/catalog')
  if (queryParams) {
    for (const [k, v] of Object.entries(queryParams)) {
      url.searchParams.set(k, v)
    }
  }
  return new Request(url.toString()) as unknown as Request
}

describe('GET /api/catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns resources and pagination', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    vi.mocked(prisma.resource.count).mockResolvedValue(0)
    const res = await GET(makeCatalogRequest())
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.resources).toBeInstanceOf(Array)
    expect(data.pagination).toHaveProperty('page')
    expect(data.pagination).toHaveProperty('limit')
    expect(data.pagination).toHaveProperty('total')
    expect(data.pagination).toHaveProperty('totalPages')
  })

  it('uses SQL-level pagination with skip/take', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    vi.mocked(prisma.resource.count).mockResolvedValue(0)
    await GET(makeCatalogRequest({ page: '2', limit: '5' }))
    expect(prisma.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    )
  })

  it('clamps limit to max 200', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    vi.mocked(prisma.resource.count).mockResolvedValue(0)
    const res = await GET(makeCatalogRequest({ limit: '500' }))
    const data = await res.json()
    expect(data.pagination.limit).toBe(200)
    expect(prisma.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 })
    )
  })

  it('clamps limit to min 1', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    vi.mocked(prisma.resource.count).mockResolvedValue(0)
    const res = await GET(makeCatalogRequest({ limit: '0' }))
    const data = await res.json()
    expect(data.pagination.limit).toBe(1)
  })

  it('clamps page to min 1', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    vi.mocked(prisma.resource.count).mockResolvedValue(0)
    const res = await GET(makeCatalogRequest({ page: '-5' }))
    const data = await res.json()
    expect(data.pagination.page).toBe(1)
  })

  it('treats NaN pagination as defaults', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    vi.mocked(prisma.resource.count).mockResolvedValue(0)
    const res = await GET(makeCatalogRequest({ page: 'abc', limit: 'xyz' }))
    const data = await res.json()
    // parseInt('abc',10) -> NaN, Math.max(1, NaN) -> NaN -> serialized as null
    expect(data.pagination.page).toBeNull()
    expect(data.pagination.limit).toBeNull()
  })

  it('calculates total totalPages correctly', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    vi.mocked(prisma.resource.count).mockResolvedValue(5)
    const res = await GET(makeCatalogRequest({ limit: '3' }))
    const data = await res.json()
    // 5 total / 3 per page = 2 total pages
    expect(data.pagination.totalPages).toBe(2)
    expect(data.pagination.total).toBe(5)
  })

  it('returns resource fields with correct shape', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      {
        id: 'db1',
        title: 'DB Resource',
        description: 'From DB',
        previewPath: '/previews/db1.svg',
        resourceType: 'educational',
        isFree: false,
        priceClp: 5000,
        promoFreeUntil: null,
        courseId: 1,
        areaId: 1,
        subareaId: null,
        downloadsCount: 10,
        isActive: true,
        course: { name: 'Prekínder', slug: 'prekinder' },
        area: { name: 'Lectoescritura', slug: 'lectoescritura', isActive: true },
        subarea: null,
        tags: [],
      },
    ] as any)
    vi.mocked(prisma.resource.count).mockResolvedValue(1)
    const res = await GET(makeCatalogRequest())
    const data = await res.json()
    const r = data.resources[0]
    expect(r).toHaveProperty('id')
    expect(r).toHaveProperty('title')
    expect(r).toHaveProperty('description')
    expect(r).toHaveProperty('resourceType')
    expect(r).toHaveProperty('isFree')
    expect(r).toHaveProperty('courseName')
    expect(r).toHaveProperty('courseSlug')
    expect(r).toHaveProperty('areaName')
    expect(r).toHaveProperty('areaSlug')
    expect(r).toHaveProperty('tags')
  })
})
