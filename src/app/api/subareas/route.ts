import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminWithCsrf, enforceRateLimit } from '@/lib/api-helpers'
import { generateSlug } from '@/lib/utils'
import { logger } from '@/lib/logger'

/** POST /api/subareas — Crea una subárea nueva */
export async function POST(request: NextRequest) {
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'subarea-create', 20)
  if (rateLimited) return rateLimited

  try {
    const { name, areaId, sortOrder } = await request.json()
    if (!name?.trim() || areaId == null || isNaN(Number(areaId))) {
      return NextResponse.json({ error: 'Nombre y área son requeridos' }, { status: 400 })
    }

    const slug = generateSlug(name)

    const maxOrder = await prisma.subarea.aggregate({ _max: { sortOrder: true }, where: { areaId } })
    const subarea = await prisma.subarea.create({
      data: {
        name: name.trim(),
        slug,
        areaId,
        sortOrder: sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    })

    return NextResponse.json({ subarea }, { status: 201 })
  } catch (err: unknown) {
    logger.error('Error al crear subárea', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al crear subárea' }, { status: 500 })
  }
}
