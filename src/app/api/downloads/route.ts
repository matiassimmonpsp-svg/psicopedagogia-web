import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** GET /api/downloads — Recursos que el usuario puede descargar (comprados + siempre-gratis) */
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const compras = await prisma.orderItem.findMany({
    where: { order: { userId: user.id, status: 'completed' } },
    include: {
      resource: {
        select: {
          id: true, title: true, isFree: true, resourceType: true,
          courseId: true, areaId: true,
          course: { select: { name: true, slug: true } },
          area: { select: { slug: true } },
        },
      },
      order: { select: { createdAt: true } },
    },
    orderBy: { order: { createdAt: 'desc' } },
  })

  const descargas = await prisma.download.findMany({
    where: { userId: user.id, resource: { isFree: true } },
    include: {
      resource: {
        select: {
          id: true, title: true, isFree: true, resourceType: true,
          courseId: true, areaId: true,
          course: { select: { name: true, slug: true } },
          area: { select: { slug: true } },
        },
      },
    },
    orderBy: { downloadedAt: 'desc' },
  })

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
    })),
  ].filter(item => {
    if (vistos.has(item.resourceId)) return false
    vistos.add(item.resourceId)
    return true
  })

  return NextResponse.json({ downloads: todos })
}
