import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { allResources as mockResources, courses as mockCourses, areas as mockAreas, subareas as mockSubareas } from '@/lib/data'

export async function GET() {
  const dbResources = await prisma.resource.findMany({
    include: { course: true, area: true, subarea: true, tags: { include: { tag: true } } },
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
      areaName: r.area.name,
      subareaName: r.subarea?.name || null,
      tags: r.tags.map(t => t.tag.name),
      source: 'db' as const,
    })),
    ...mockResources.filter(m => !dbResources.some(d => d.id === m.id)).map(m => ({
      ...m,
      source: 'mock' as const,
    })),
  ]

  return NextResponse.json({
    resources: combined,
    courses: mockCourses,
    areas: mockAreas,
    subareas: mockSubareas,
  })
}
