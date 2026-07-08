import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { upsertTags } from '@/lib/utils'
import { csrfCheck } from '@/lib/csrf'

async function resolveCourseId(mockId: number): Promise<number | null> {
  const mock = await import('@/lib/data')
  const mc = mock.courses.find((c: any) => c.id === mockId)
  if (!mc) return null

  const existing = await prisma.course.findUnique({ where: { id: mockId } })
  if (existing) return existing.id

  const bySlug = await prisma.course.findFirst({ where: { slug: mc.slug } })
  if (bySlug) return bySlug.id

  const created = await prisma.course.create({ data: { id: mc.id, name: mc.name, slug: mc.slug } })
  return created.id
}

async function resolveAreaId(mockId: number): Promise<number | null> {
  const mock = await import('@/lib/data')
  const ma = mock.areas.find((a: any) => a.id === mockId)
  if (!ma) return null

  const existing = await prisma.area.findUnique({ where: { id: mockId } })
  if (existing) return existing.id

  const bySlug = await prisma.area.findFirst({ where: { slug: ma.slug } })
  if (bySlug) return bySlug.id

  const created = await prisma.area.create({ data: { id: ma.id, name: ma.name, slug: ma.slug } })
  return created.id
}

async function resolveSubareaId(mockId: number): Promise<number | null> {
  const mock = await import('@/lib/data')
  const ms = mock.subareas.find((s: any) => s.id === mockId)
  if (!ms) return null

  const existing = await prisma.subarea.findUnique({ where: { id: mockId } })
  if (existing) return existing.id

  const bySlug = await prisma.subarea.findFirst({ where: { slug: ms.slug } })
  if (bySlug) return bySlug.id

  const created = await prisma.subarea.create({ data: { id: ms.id, areaId: ms.areaId, name: ms.name, slug: ms.slug } })
  return created.id
}

export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { title, description, resourceType, courseId, areaId, subareaId, isFree, priceClp, tags, filePath, editablePath, previewPath } = body

    if (!title || courseId == null || areaId == null || !filePath) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const cId = Number(courseId)
    const aId = Number(areaId)
    const sId = subareaId != null && subareaId !== '' ? Number(subareaId) : null

    const resolvedCourseId = await resolveCourseId(cId)
    if (!resolvedCourseId) return NextResponse.json({ error: `No se pudo resolver courseId ${cId}` }, { status: 400 })

    const resolvedAreaId = await resolveAreaId(aId)
    if (!resolvedAreaId) return NextResponse.json({ error: `No se pudo resolver areaId ${aId}` }, { status: 400 })

    let resolvedSubareaId: number | null = null
    if (sId !== null) {
      resolvedSubareaId = await resolveSubareaId(sId)
      if (!resolvedSubareaId) return NextResponse.json({ error: `No se pudo resolver subareaId ${sId}` }, { status: 400 })
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        filePath,
        editablePath: editablePath || null,
        previewPath: previewPath || '/previews/placeholder.svg',
        resourceType: resourceType || 'evaluation',
        isFree: isFree ?? true,
        priceClp: isFree ? null : (priceClp ? Number(priceClp) : null),
        courseId: resolvedCourseId,
        areaId: resolvedAreaId,
        subareaId: resolvedSubareaId,
        downloadsCount: 0,
        isActive: true,
      },
    })

    if (tags) await upsertTags(tags, resource.id, prisma)

    return NextResponse.json({ resource }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear recurso'
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError
    return NextResponse.json({
      error: message,
      ...(isPrismaError && { code: err.code, meta: err.meta }),
    }, { status: 500 })
  }
}

export async function GET() {
  const resources = await prisma.resource.findMany({
    include: { course: true, area: true, subarea: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ resources })
}
