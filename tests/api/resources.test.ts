import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    course: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Prekínder', slug: 'prekinder' }) },
    area: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Lectoescritura', slug: 'lectoescritura' }) },
    subarea: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Sub', areaId: 1 }) },
    resourceTag: { deleteMany: vi.fn() },
    orderItem: { deleteMany: vi.fn() },
    download: { deleteMany: vi.fn() },
  },
}))

vi.mock('@/lib/csrf', () => ({ csrfCheck: vi.fn().mockReturnValue(null) }))
vi.mock('@/lib/utils', () => ({ upsertTags: vi.fn() }))

import { POST as resourcesPOST, GET as resourcesGET } from '@/app/api/resources/route'
import { GET as resourceGET, PATCH as resourcePATCH, PUT as resourcePUT, DELETE as resourceDELETE } from '@/app/api/resources/[id]/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

function makeReq(body?: Record<string, unknown>, method = 'GET') {
  return {
    json: body ? () => Promise.resolve(body) : undefined,
    headers: new Headers({ 'content-type': 'application/json' }),
    method,
    url: 'http://localhost:3000/api/resources',
  } as any
}

// ============================================================
// POST /api/resources — Crear recurso
// ============================================================
describe('POST /api/resources', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await resourcesPOST(makeReq({ title: 'Test' }) as any)
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    const res = await resourcesPOST(makeReq({ courseId: 1, areaId: 1, filePath: '/test.pdf' }) as any)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('Faltan campos')
  })

  it('returns 400 when courseId is missing', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    const res = await resourcesPOST(makeReq({ title: 'Test', areaId: 1, filePath: '/test.pdf' }) as any)
    expect(res.status).toBe(400)
  })

  it('returns 400 when filePath is missing', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    const res = await resourcesPOST(makeReq({ title: 'Test', courseId: 1, areaId: 1 }) as any)
    expect(res.status).toBe(400)
  })

  it('returns 400 when course does not exist', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null)
    const res = await resourcesPOST(makeReq({ title: 'Test', courseId: 999, areaId: 1, filePath: '/test.pdf' }) as any)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('Curso o área inválidos')
  })

  it('creates resource with valid data', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: 1, name: 'Prekínder', slug: 'prekinder' } as any)
    vi.mocked(prisma.area.findUnique).mockResolvedValue({ id: 1, name: 'Lectoescritura', slug: 'lectoescritura' } as any)
    vi.mocked(prisma.resource.create).mockResolvedValue({ id: 'r1', title: 'Nuevo recurso' } as any)
    const res = await resourcesPOST(makeReq({
      title: 'Nuevo recurso', courseId: 1, areaId: 1, filePath: '/test.pdf', isFree: true,
    }) as any)
    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.resource.id).toBe('r1')
    expect(prisma.resource.create).toHaveBeenCalled()
  })

  it('sets isActive to true on creation', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: 1 } as any)
    vi.mocked(prisma.area.findUnique).mockResolvedValue({ id: 1 } as any)
    vi.mocked(prisma.resource.create).mockResolvedValue({ id: 'r1' } as any)
    await resourcesPOST(makeReq({ title: 'Test', courseId: 1, areaId: 1, filePath: '/a.pdf' }) as any)
    const call = vi.mocked(prisma.resource.create).mock.calls[0][0]
    expect(call.data.isActive).toBe(true)
  })

  it('returns 500 on unexpected error', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: 1 } as any)
    vi.mocked(prisma.area.findUnique).mockResolvedValue({ id: 1 } as any)
    vi.mocked(prisma.resource.create).mockRejectedValue(new Error('DB error'))
    const res = await resourcesPOST(makeReq({ title: 'Test', courseId: 1, areaId: 1, filePath: '/a.pdf' }) as any)
    expect(res.status).toBe(500)
  })
})

// ============================================================
// GET /api/resources — Listar recursos
// ============================================================
describe('GET /api/resources', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns resources list', async () => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([
      { id: 'r1', title: 'Recurso 1', course: {}, area: {}, subarea: null, tags: [] },
    ] as any)
    const res = await resourcesGET()
    const data = await res.json()
    expect(data.resources).toHaveLength(1)
  })
})

// ============================================================
// GET /api/resources/[id]
// ============================================================
describe('GET /api/resources/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 404 when resource not found', async () => {
    vi.mocked(prisma.resource.findUnique).mockResolvedValue(null)
    const res = await resourceGET(makeReq(), { params: { id: 'nonexistent' } })
    expect(res.status).toBe(404)
  })

  it('returns resource with isOwned false when not logged in', async () => {
    vi.mocked(prisma.resource.findUnique).mockResolvedValue({
      id: 'r1', title: 'Test', isActive: true, course: {}, area: {}, subarea: null, tags: [],
    } as any)
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const res = await resourceGET(makeReq(), { params: { id: 'r1' } })
    const data = await res.json()
    expect(data.resource.isOwned).toBe(false)
  })

  it('returns resource with isActive field', async () => {
    vi.mocked(prisma.resource.findUnique).mockResolvedValue({
      id: 'r1', title: 'Test', isActive: false, course: {}, area: {}, subarea: null, tags: [],
    } as any)
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const res = await resourceGET(makeReq(), { params: { id: 'r1' } })
    const data = await res.json()
    expect(data.resource.isActive).toBe(false)
  })
})

// ============================================================
// PATCH /api/resources/[id] — Pausar/Reanudar
// ============================================================
describe('PATCH /api/resources/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await resourcePATCH(makeReq({ isActive: false }, 'PATCH'), { params: { id: 'r1' } })
    expect(res.status).toBe(401)
  })

  it('pauses resource (sets isActive to false)', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.resource.update).mockResolvedValue({ id: 'r1', isActive: false } as any)
    const res = await resourcePATCH(makeReq({ isActive: false }, 'PATCH'), { params: { id: 'r1' } })
    const data = await res.json()
    expect(data.resource.isActive).toBe(false)
  })

  it('resumes resource (sets isActive to true)', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.resource.update).mockResolvedValue({ id: 'r1', isActive: true } as any)
    const res = await resourcePATCH(makeReq({ isActive: true }, 'PATCH'), { params: { id: 'r1' } })
    const data = await res.json()
    expect(data.resource.isActive).toBe(true)
  })

  it('returns 500 on DB error', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.resource.update).mockRejectedValue(new Error('DB fail'))
    const res = await resourcePATCH(makeReq({ isActive: false }, 'PATCH'), { params: { id: 'r1' } })
    expect(res.status).toBe(500)
  })
})

// ============================================================
// DELETE /api/resources/[id]
// ============================================================
describe('DELETE /api/resources/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await resourceDELETE(makeReq({}, 'DELETE'), { params: { id: 'r1' } })
    expect(res.status).toBe(401)
  })

  it('returns 404 when resource not found', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.resource.findUnique).mockResolvedValue(null)
    const res = await resourceDELETE(makeReq({}, 'DELETE'), { params: { id: 'r1' } })
    expect(res.status).toBe(404)
  })

  it('deletes resource successfully', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(prisma.resource.findUnique).mockResolvedValue({ id: 'r1', filePath: null, editablePath: null, previewPath: null } as any)
    vi.mocked(prisma.resourceTag.deleteMany).mockResolvedValue({ count: 0 } as any)
    vi.mocked(prisma.orderItem.deleteMany).mockResolvedValue({ count: 0 } as any)
    vi.mocked(prisma.download.deleteMany).mockResolvedValue({ count: 0 } as any)
    vi.mocked(prisma.resource.delete).mockResolvedValue({} as any)
    const res = await resourceDELETE(makeReq({}, 'DELETE'), { params: { id: 'r1' } })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(prisma.resourceTag.deleteMany).toHaveBeenCalledWith({ where: { resourceId: 'r1' } })
    expect(prisma.resource.delete).toHaveBeenCalledWith({ where: { id: 'r1' } })
  })
})
