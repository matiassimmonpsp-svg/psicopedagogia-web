import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    subarea: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), aggregate: vi.fn() },
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

import { POST as subareasPOST } from '@/app/api/subareas/route'
import { PATCH as subareaPATCH, DELETE as subareaDELETE } from '@/app/api/subareas/[id]/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

const adminUser = { id: 'a1', name: 'Admin', email: 'a@b.cl', role: 'admin' }

function makeReq(body?: Record<string, unknown>, method = 'GET') {
  return { json: body ? () => Promise.resolve(body) : undefined, headers: new Headers({ 'content-type': 'application/json' }), method, url: 'http://localhost:3000/api/subareas' } as any
}

describe('POST /api/subareas', () => {
  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await subareasPOST(makeReq({ name: 'Nueva', areaId: 1 }, 'POST'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when name or areaId missing', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await subareasPOST(makeReq({ name: 'Nueva' }, 'POST'))
    expect(res.status).toBe(400)
  })

  it('creates subarea', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.subarea.aggregate).mockResolvedValue({ _max: { sortOrder: 5 } } as any)
    vi.mocked(prisma.subarea.create).mockResolvedValue({ id: 10, name: 'Nueva', slug: 'nueva', areaId: 1 } as any)
    const res = await subareasPOST(makeReq({ name: 'Nueva', areaId: 1 }, 'POST'))
    expect(res.status).toBe(201)
  })
})

describe('PATCH /api/subareas/[id]', () => {
  it('returns 400 for invalid id', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await subareaPATCH(makeReq({ name: 'Test' }, 'PATCH'), { params: { id: 'abc' } })
    expect(res.status).toBe(400)
  })

  it('updates subarea', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.subarea.update).mockResolvedValue({ id: 1, name: 'Actualizado', slug: 'actualizado' } as any)
    const res = await subareaPATCH(makeReq({ name: 'Actualizado' }, 'PATCH'), { params: { id: '1' } })
    const data = await res.json()
    expect(data.subarea.name).toBe('Actualizado')
  })
})

describe('DELETE /api/subareas/[id]', () => {
  it('returns 404 when not found', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.subarea.findUnique).mockResolvedValue(null)
    const res = await subareaDELETE(makeReq({}, 'DELETE'), { params: { id: '999' } })
    expect(res.status).toBe(404)
  })

  it('deletes subarea', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.subarea.findUnique).mockResolvedValue({ id: 1, _count: { resources: 0 } } as any)
    const res = await subareaDELETE(makeReq({}, 'DELETE'), { params: { id: '1' } })
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
