import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** GET /api/users — Lista todos los usuarios (admin) */
export async function GET() {
  try {
    const admin = await requireAdminSession()
    if (admin instanceof NextResponse) return admin

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { orders: true, downloads: true } },
      },
    })
    return NextResponse.json({ users })
  } catch (err: unknown) {
    logger.error('Error al obtener usuarios', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}
