import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/**
 * GET /api/catalog — Devuelve recursos paginados desde la BD.
 * Pagination is done at the SQL level (skip/take) for performance.
 */
export async function GET(request: Request) {
  try {
    const rateLimited = await enforceRateLimit(request, 'catalog', 60)
    if (rateLimited) return rateLimited

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const skip = (page - 1) * limit

    const session = await getSession().catch(() => null)
    const isAdmin = session?.role === 'admin'

    const where = isAdmin
      ? {}
      : { isActive: true, area: { isActive: true } }

    const select = {
      id: true, title: true, description: true, previewPath: true,
      resourceType: true, isFree: true, priceClp: true, promoFreeUntil: true,
      courseId: true, areaId: true, subareaId: true, downloadsCount: true, isActive: true,
      course: { select: { name: true, slug: true } },
      area: { select: { name: true, slug: true, isActive: true } },
      subarea: { select: { name: true, slug: true, isActive: true } },
      tags: { select: { tag: { select: { name: true } } } },
    } as const

    const [resources, total, ownedItems] = await Promise.all([
      prisma.resource.findMany({ where, select, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.resource.count({ where }),
      session
        ? prisma.orderItem.findMany({
            where: { order: { userId: session.id, status: 'completed' } },
            select: { resourceId: true },
          })
        : [],
    ])

    const ownedResourceIds = new Set(ownedItems.map(i => i.resourceId))

    const mapped = resources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      previewPath: r.previewPath,
      resourceType: r.resourceType,
      isFree: r.isFree,
      priceClp: r.priceClp,
      promoFreeUntil: r.promoFreeUntil ? r.promoFreeUntil.toISOString() : null,
      courseId: r.courseId,
      areaId: r.areaId,
      subareaId: r.subareaId,
      downloadsCount: r.downloadsCount,
      isActive: r.isActive,
      courseName: r.course.name,
      courseSlug: r.course.slug,
      areaName: r.area.name,
      areaSlug: r.area.slug,
      subareaName: r.subarea?.name || null,
      subareaSlug: r.subarea?.slug || null,
      tags: r.tags.map(t => t.tag.name),
      isOwned: ownedResourceIds.has(r.id),
    }))

    return NextResponse.json({
      resources: mapped,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err: unknown) {
    logger.error('Error al obtener catálogo', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener catálogo' }, { status: 500 })
  }
}
