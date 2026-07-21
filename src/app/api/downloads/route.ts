import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enforceRateLimit, requireSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** GET /api/downloads — Recursos que el usuario puede descargar (comprados + siempre-gratis) */
export async function GET(request: Request) {
  try {
    const rateLimited = await enforceRateLimit(request, 'downloads', 30)
    if (rateLimited) return rateLimited

    const user = await requireSession()
    if (user instanceof NextResponse) return user

    const [compras, descargas] = await Promise.all([
    prisma.orderItem.findMany({
      take: 100,
      where: { order: { userId: user.id, status: 'completed' } },
      include: {
        resource: {
          select: {
            id: true, title: true, isFree: true, resourceType: true,
            courseId: true, areaId: true, isActive: true,
            course: { select: { name: true, slug: true } },
            area: { select: { slug: true, isActive: true } },
          },
        },
        order: { select: { createdAt: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
    }),
    prisma.download.findMany({
      take: 100,
      where: { userId: user.id, resource: { isFree: true } },
      include: {
        resource: {
          select: {
            id: true, title: true, isFree: true, resourceType: true,
            courseId: true, areaId: true, isActive: true,
            course: { select: { name: true, slug: true } },
            area: { select: { slug: true, isActive: true } },
          },
        },
      },
      orderBy: { downloadedAt: 'desc' },
    }),
  ])

  const vistos = new Set<string>()
  const todos = [
    ...compras.map(c => ({
      id: `purchased-${c.id}`,
      resourceId: c.resource.id,
      title: c.resource.title,
      courseName: c.resource.course?.name || null,
      courseSlug: c.resource.course?.slug || null,
      courseId: c.resource.courseId,
      areaSlug: c.resource.area?.slug || null,
      areaId: c.resource.areaId,
      resourceType: c.resource.resourceType,
      date: c.order.createdAt.toISOString(),
      type: 'purchased' as const,
      isActive: c.resource.isActive,
      areaIsActive: c.resource.area?.isActive ?? true,
    })),
    ...descargas.map(d => ({
      id: `free-${d.id}`,
      resourceId: d.resource.id,
      title: d.resource.title,
      courseName: d.resource.course?.name || null,
      courseSlug: d.resource.course?.slug || null,
      courseId: d.resource.courseId,
      areaSlug: d.resource.area?.slug || null,
      areaId: d.resource.areaId,
      resourceType: d.resource.resourceType,
      date: d.downloadedAt.toISOString(),
      type: 'free' as const,
      isActive: d.resource.isActive,
      areaIsActive: d.resource.area?.isActive ?? true,
    })),
  ].filter(item => {
    if (vistos.has(item.resourceId)) return false
    vistos.add(item.resourceId)
    return true
  })

    return NextResponse.json({ downloads: todos })
  } catch (err: unknown) {
    logger.error('Error al obtener descargas', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener descargas' }, { status: 500 })
  }
}
