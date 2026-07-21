import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** GET /api/admin/stats — Estadísticas del dashboard */
export async function GET() {
  try {
    const admin = await requireAdminSession()
    if (admin instanceof NextResponse) return admin

    const [users, orders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({ where: { status: 'completed' } }),
    ])

    return NextResponse.json({ users, orders })
  } catch (err: unknown) {
    logger.error('Error al obtener estadísticas', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
