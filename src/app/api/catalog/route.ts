import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { allResources as mockResources, courses as mockCourses, areas as mockAreas, subareas as mockSubareas } from '@/lib/data'

/**
 * GET /api/catalog — Devuelve todos los recursos combinando BD + mock data.
 * Soporta paginación con ?page=1&limit=12 (opcional, sin filtros).
 * Incluye slugs de curso y área para filtrar por nombre en vez de ID.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))

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
      source: 'db' as const,
    })),
    // Recursos mock que no existen en BD (por si se agregaron manualmente en data.ts)
    ...mockResources.filter(m => !dbResources.some(d => d.id === m.id)).map(m => ({
      ...m,
      courseSlug: mockCourses.find(c => c.id === m.courseId)?.slug || null,
      areaSlug: mockAreas.find(a => a.id === m.areaId)?.slug || null,
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
