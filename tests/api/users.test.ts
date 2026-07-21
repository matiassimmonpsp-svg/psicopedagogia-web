import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
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

import { GET as usersGET } from '@/app/api/users/route'
import { PUT as userPUT, PATCH as userPATCH, DELETE as userDELETE } from '@/app/api/users/[id]/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

const adminUser = { id: 'a1', name: 'Admin', email: 'a@b.cl', role: 'admin' }

function makeReq(body?: Record<string, unknown>, method = 'GET') {
  return {
    json: body ? () => Promise.resolve(body) : undefined,
    headers: new Headers({ 'content-type': 'application/json' }),
    method,
    url: 'http://localhost:3000/api/users',
  } as any
}

describe('GET /api/users', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await usersGET()
    expect(res.status).toBe(401)
  })

  it('returns users list', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'u1', name: 'User', email: 'u@b.cl', role: 'user', createdAt: new Date(), _count: { orders: 0, downloads: 0 } },
    ] as any)
    const res = await usersGET()
    const data = await res.json()
    expect(data.users).toHaveLength(1)
  })
})

describe('PUT /api/users/[id]', () => {
  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await userPUT(makeReq({ role: 'user' }), { params: { id: 'u1' } })
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid role', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    const res = await userPUT(makeReq({ role: 'superadmin' }), { params: { id: 'u1' } })
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Rol inválido')
  })

  it('updates role successfully', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'u1', name: 'User', email: 'u@b.cl', role: 'user' } as any)
    const res = await userPUT(makeReq({ role: 'user' }), { params: { id: 'u1' } })
    const data = await res.json()
    expect(data.user.role).toBe('user')
  })
})

describe('PATCH /api/users/[id]', () => {
  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await userPATCH(makeReq({ name: 'New' }), { params: { id: 'u1' } })
    expect(res.status).toBe(401)
  })

  it('updates user name and email', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'u1', name: 'Nuevo', email: 'nuevo@b.cl', role: 'user' } as any)
    const res = await userPATCH(makeReq({ name: 'Nuevo', email: 'nuevo@b.cl' }), { params: { id: 'u1' } })
    const data = await res.json()
    expect(data.user.name).toBe('Nuevo')
  })
})

describe('DELETE /api/users/[id]', () => {
  it('returns 401 when not admin', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(null)
    const res = await userDELETE(makeReq(), { params: { id: 'u1' } })
    expect(res.status).toBe(401)
  })

  it('deletes user successfully', async () => {
    vi.spyOn(auth, 'requireAdmin').mockResolvedValue(adminUser)
    vi.mocked(prisma.user.delete).mockResolvedValue({} as any)
    const res = await userDELETE(makeReq(), { params: { id: 'u1' } })
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
