import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw: vi.fn() },
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { GET as healthGET } from '@/app/api/health/route'
import { prisma } from '@/lib/prisma'

describe('GET /api/health', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns ok when db is connected', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '1': 1 }])
    const res = await healthGET()
    const data = await res.json()
    expect(data.status).toBe('ok')
  })

  it('returns 503 when db fails', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Connection refused'))
    const res = await healthGET()
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.status).toBe('error')
  })
})
