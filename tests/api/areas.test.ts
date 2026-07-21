import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    area: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), aggregate: vi.fn() },
    subarea: { deleteMany: vi.fn() },
  },
}))
vi.mock('@/lib/csrf', () => ({ csrfCheck: vi.fn().mockReturnValue(null) }))
vi.mock('@/lib/api-helpers', async (importOriginal) => {
  const original = await importOriginal() as Record<string, unknown>
  return {
    ...original,
    enforceRateLimit: vi.fn().mockResolvedValue(null),
  }
})

import { GET as areasGET, POST as areasPOST } from '@/app/api/areas/route'
import { PATCH as areaPATCH, DELETE as areaDELETE } from '@/app/api/areas/[id]/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

const adminUser = { id: 'a1', name: 'Admin', email: 'a@b.cl', role: 'admin' }

function makeReq(body?: Record<string, unknown>, method = 'GET') {
  return { json: body ? () => Promise.resolve(body) : undefined, headers: new Headers({ 'content-type': 'application/json' }), method, url: 'http://localhost:3000/api/areas' } as any
}

describe('GET /api/areas', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await areasGET()
    expect(res.status).toBe(401)
  })

  it('returns areas', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.area.findMany).mockResolvedValue([{ id: 1, name: 'Lectoescritura', slug: 'lectoescritura', sortOrder: 1, isActive: true, subareas: [], _count: { resources: 5 } }] as any)
    const res = await areasGET()
    const data = await res.json()
    expect(data.areas[0].name).toBe('Lectoescritura')
  })
})

describe('POST /api/areas', () => {
  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await areasPOST(makeReq({ name: 'Nueva' }, 'POST'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when name missing', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await areasPOST(makeReq({}, 'POST'))
    expect(res.status).toBe(400)
  })

  it('creates area', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.area.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.area.aggregate).mockResolvedValue({ _max: { sortOrder: 1 } } as any)
    vi.mocked(prisma.area.create).mockResolvedValue({ id: 2, name: 'Nueva', slug: 'nueva', sortOrder: 2 } as any)
    const res = await areasPOST(makeReq({ name: 'Nueva' }, 'POST'))
    expect(res.status).toBe(201)
  })
})

describe('PATCH /api/areas/[id]', () => {
  it('returns 400 for invalid id', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await areaPATCH(makeReq({ name: 'Test' }, 'PATCH'), { params: { id: 'abc' } })
    expect(res.status).toBe(400)
  })

  it('updates area', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.area.update).mockResolvedValue({ id: 1, name: 'Actualizado', slug: 'actualizado' } as any)
    const res = await areaPATCH(makeReq({ name: 'Actualizado' }, 'PATCH'), { params: { id: '1' } })
    const data = await res.json()
    expect(data.area.name).toBe('Actualizado')
  })
})

describe('DELETE /api/areas/[id]', () => {
  it('returns 400 for invalid id', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await areaDELETE(makeReq({}, 'DELETE'), { params: { id: 'abc' } })
    expect(res.status).toBe(400)
  })

  it('returns 404 when not found', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.area.findUnique).mockResolvedValue(null)
    const res = await areaDELETE(makeReq({}, 'DELETE'), { params: { id: '999' } })
    expect(res.status).toBe(404)
  })
})
