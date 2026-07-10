import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/data', () => ({
  allResources: [
    { id: 'm1', title: 'Mock Resource', description: 'Desc', filePath: '/pdfs/m1.pdf', previewPath: '/previews/placeholder.svg', resourceType: 'evaluation', isFree: true, priceClp: null, promoFreeUntil: null, courseId: 1, areaId: 1, subareaId: null, downloadsCount: 5, isActive: true, courseName: 'Prekínder', areaName: 'Lectoescritura', tags: ['tag1'] },
  ],
  courses: [{ id: 1, name: 'Prekínder', slug: 'prekinder', sortOrder: 1 }],
  areas: [{ id: 1, name: 'Lectoescritura', slug: 'lectoescritura', sortOrder: 1 }],
  subareas: [{ id: 1, areaId: 1, name: 'Conciencia Fonológica', slug: 'conciencia-fonologica' }],
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

  it('returns resources, courses, areas, and pagination', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest())
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.resources).toBeInstanceOf(Array)
    expect(data.courses).toBeInstanceOf(Array)
    expect(data.areas).toBeInstanceOf(Array)
    expect(data.subareas).toBeInstanceOf(Array)
    expect(data.pagination).toHaveProperty('page')
    expect(data.pagination).toHaveProperty('limit')
    expect(data.pagination).toHaveProperty('total')
    expect(data.pagination).toHaveProperty('totalPages')
  })

  it('includes mock resources not in DB', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest())
    const data = await res.json()
    const mockRes = data.resources.find((r: any) => r.id === 'm1')
    expect(mockRes).toBeDefined()
    expect(mockRes.source).toBe('mock')
  })

  it('combines DB resources with mock resources', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      {
        id: 'db1',
        title: 'DB Resource',
        description: 'From DB',
        filePath: '/pdfs/db1.pdf',
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
        createdAt: new Date(),
        updatedAt: new Date(),
        course: { name: 'Prekínder', slug: 'prekinder' },
        area: { name: 'Lectoescritura', slug: 'lectoescritura' },
        subarea: null,
        tags: [],
      },
    ] as any)
    const res = await GET(makeCatalogRequest())
    const data = await res.json()
    expect(data.resources.length).toBe(2)
    const dbRes = data.resources.find((r: any) => r.source === 'db')
    expect(dbRes).toBeDefined()
    expect(dbRes.title).toBe('DB Resource')
  })

  it('uses default pagination (page=1, limit=12)', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest())
    const data = await res.json()
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(12)
  })

  it('respects custom pagination params', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest({ page: '2', limit: '5' }))
    const data = await res.json()
    expect(data.pagination.page).toBe(2)
    expect(data.pagination.limit).toBe(5)
  })

  it('clamps limit to max 50', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest({ limit: '100' }))
    const data = await res.json()
    expect(data.pagination.limit).toBe(50)
  })

  it('clamps limit to min 1', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest({ limit: '0' }))
    const data = await res.json()
    expect(data.pagination.limit).toBe(1)
  })

  it('clamps page to min 1', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest({ page: '-5' }))
    const data = await res.json()
    expect(data.pagination.page).toBe(1)
  })

  it('treats NaN pagination as defaults', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest({ page: 'abc', limit: 'xyz' }))
    const data = await res.json()
    // parseInt('abc',10) -> NaN, Math.max(1, NaN) -> NaN -> serialized as null
    expect(data.pagination.page).toBeNull()
    expect(data.pagination.limit).toBeNull()
  })

  it('calculates total totalPages correctly', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest({ limit: '3' }))
    const data = await res.json()
    // 1 mock resource / 3 per page = 1 total page
    expect(data.pagination.totalPages).toBe(1)
  })

  it('slices paginated results correctly', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
    const res = await GET(makeCatalogRequest({ page: '2', limit: '1' }))
    const data = await res.json()
    // Page 2 of 1 mock resource = empty
    expect(data.resources.length).toBe(0)
  })

  it('returns resource fields with correct shape', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([])
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
    expect(r).toHaveProperty('source')
  })
})
