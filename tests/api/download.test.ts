import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderItem: { findFirst: vi.fn() },
    download: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  hashIp: vi.fn((ip: string) => `hashed-${ip}`),
}))

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  createReadStream: vi.fn().mockReturnValue({
    on: vi.fn(),
    pipe: vi.fn(),
  }),
}))

vi.mock('fs/promises', () => ({
  stat: vi.fn().mockResolvedValue({ size: 1024 }),
}))

vi.mock('stream', () => ({
  Readable: { toWeb: vi.fn().mockReturnValue(new ReadableStream()) },
}))

import { GET as downloadGET } from '@/app/api/download/[id]/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

function makeReq(query = '') {
  return {
    headers: new Headers(),
    url: `http://localhost:3000/api/download/r1${query ? '?' + query : ''}`,
    method: 'GET',
  } as any
}

// ============================================================
// GET /api/download/[id]
// ============================================================
describe('GET /api/download/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not authenticated', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)
    const res = await downloadGET(makeReq(), { params: { id: 'r1' } })
    expect(res.status).toBe(401)
  })

  it('returns 404 when resource not found', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue({ id: 'u1', name: 'User', email: 'u@b.cl', role: 'user' })
    vi.mocked(prisma.resource.findUnique).mockResolvedValue(null)
    const res = await downloadGET(makeReq(), { params: { id: 'nonexistent' } })
    expect(res.status).toBe(404)
  })

  it('returns 403 when resource is paused (isActive=false)', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue({ id: 'u1', name: 'User', email: 'u@b.cl', role: 'user' })
    vi.mocked(prisma.resource.findUnique).mockResolvedValue({
      id: 'r1', isActive: false, isFree: true, filePath: '/test.pdf',
    } as any)
    const res = await downloadGET(makeReq(), { params: { id: 'r1' } })
    const data = await res.json()
    expect(res.status).toBe(403)
    expect(data.error).toContain('no está disponible temporalmente')
  })

  it('allows download of active free resource', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue({ id: 'u1', name: 'User', email: 'u@b.cl', role: 'user' })
    vi.mocked(prisma.resource.findUnique).mockResolvedValue({
      id: 'r1', isActive: true, isFree: true, filePath: '/uploads/test.pdf',
      promoFreeUntil: null, editablePath: null, title: 'Test Resource',
    } as any)
    vi.mocked(prisma.download.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.download.create).mockResolvedValue({} as any)
    vi.mocked(prisma.resource.update).mockResolvedValue({} as any)
    const res = await downloadGET(makeReq(), { params: { id: 'r1' } })
    expect(res.status).toBe(200)
  })

  it('returns 403 when not paid for premium resource', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue({ id: 'u1', name: 'User', email: 'u@b.cl', role: 'user' })
    vi.mocked(prisma.resource.findUnique).mockResolvedValue({
      id: 'r1', isActive: true, isFree: false, filePath: '/test.pdf',
      promoFreeUntil: null, editablePath: null, title: 'Premium',
    } as any)
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValue(null)
    const res = await downloadGET(makeReq(), { params: { id: 'r1' } })
    expect(res.status).toBe(403)
  })
})
