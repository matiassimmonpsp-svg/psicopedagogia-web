import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminWithCsrf, enforceRateLimit, requireAdminSession } from '@/lib/api-helpers'
import { generateSlug } from '@/lib/utils'
import { logger } from '@/lib/logger'

/** GET /api/areas — Lista todas las áreas con sus subáreas */
export async function GET() {
  try {
    const admin = await requireAdminSession()
    if (admin instanceof NextResponse) return admin

    const areas = await prisma.area.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        subareas: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { resources: true } } },
        },
        _count: { select: { resources: true } },
      },
    })
    return NextResponse.json({ areas })
  } catch (err: unknown) {
    logger.error('Error al obtener áreas', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener áreas' }, { status: 500 })
  }
}

/** POST /api/areas — Crea una nueva área */
export async function POST(request: NextRequest) {
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'area-create', 20)
  if (rateLimited) return rateLimited

  try {
    const { name, sortOrder } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    const slug = generateSlug(name)

    const existing = await prisma.area.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un área con ese nombre' }, { status: 409 })
    }

    const maxOrder = await prisma.area.aggregate({ _max: { sortOrder: true } })
    const area = await prisma.area.create({
      data: {
        name: name.trim(),
        slug,
        sortOrder: sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    })

    return NextResponse.json({ area }, { status: 201 })
  } catch (err: unknown) {
    logger.error('Error al crear área', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al crear área' }, { status: 500 })
  }
}
