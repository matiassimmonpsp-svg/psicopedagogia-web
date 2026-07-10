import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

/** GET /api/admin/stats — Estadísticas del dashboard */
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [users, orders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count({ where: { status: 'completed' } }),
  ])

  return NextResponse.json({ users, orders })
}
