import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { allResources as mockResources, courses as mockCourses, areas as mockAreas, subareas as mockSubareas } from '@/lib/data'

/**
 * GET /api/catalog — Devuelve todos los recursos combinando BD + mock data.
 * Si el usuario está autenticado, incluye `isOwned` para cada recurso.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))

  /* Obtener IDs de recursos que el usuario ya posee (compra completada) */
  let ownedResourceIds: Set<string> = new Set()
  try {
    const session = await getSession()
    if (session) {
      const ownedItems = await prisma.orderItem.findMany({
        where: { order: { userId: session.id, status: 'completed' } },
        select: { resourceId: true },
      })
      ownedResourceIds = new Set(ownedItems.map(i => i.resourceId))
    }
  } catch {
    /* Sin sesión: catálogo público, todos los isOwned serán false */
  }

  const dbResources = await prisma.resource.findMany({
    select: {
      id: true, title: true, description: true, filePath: true, previewPath: true,
      resourceType: true, isFree: true, priceClp: true, promoFreeUntil: true,
      courseId: true, areaId: true, subareaId: true, downloadsCount: true, isActive: true,
      course: { select: { name: true, slug: true } },
      area: { select: { name: true, slug: true } },
      subarea: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const combined = [
    ...dbResources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      filePath: r.filePath,
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
      source: 'db' as const,
    })),
    // Recursos mock que no existen en BD
    ...mockResources.filter(m => !dbResources.some(d => d.id === m.id)).map(m => ({
      ...m,
      courseSlug: mockCourses.find(c => c.id === m.courseId)?.slug || null,
      areaSlug: mockAreas.find(a => a.id === m.areaId)?.slug || null,
      isOwned: false,
      source: 'mock' as const,
    })),
  ]

  const total = combined.length
  const paginated = combined.slice((page - 1) * limit, (page - 1) * limit + limit)

  return NextResponse.json({
    resources: paginated,
    courses: mockCourses,
    areas: mockAreas,
    subareas: mockSubareas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
