import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import type { Resource } from '@/lib/interfaces'

interface RawResource {
  id: string
  title: string
  description: string
  previewPath: string
  resourceType: string
  isFree: boolean
  priceClp: number | null
  promoFreeUntil: Date | null
  courseId: number
  areaId: number
  subareaId: number | null
  downloadsCount: number
  isActive: boolean
  course: { name: string; slug: string } | null
  area: { name: string; slug: string } | null
  subarea: { name: string; slug: string } | null
  tags: { tag: { name: string } | null }[]
}

function mapResource(r: RawResource): Omit<Resource, 'filePath'> {
  return {
    id: r.id, title: r.title, description: r.description, previewPath: r.previewPath,
    resourceType: r.resourceType as Resource['resourceType'], isFree: r.isFree, priceClp: r.priceClp,
    promoFreeUntil: r.promoFreeUntil?.toISOString?.() || null,
    courseId: r.courseId, areaId: r.areaId, subareaId: r.subareaId,
    downloadsCount: r.downloadsCount, isActive: r.isActive,
    courseName: r.course?.name || '', courseSlug: r.course?.slug || '',
    areaName: r.area?.name || '', areaSlug: r.area?.slug || '',
    subareaName: r.subarea?.name || null, subareaSlug: r.subarea?.slug || null,
    tags: r.tags?.map((t) => t.tag?.name).filter((n): n is string => !!n) || [],
  }
}

/** Short TTL in-memory cache for home-featured (30s) */
const CACHE_TTL = 30_000
let featuredCache: { data: { free: Omit<Resource, 'filePath'>[]; premium: Omit<Resource, 'filePath'>[] }; ts: number } | null = null

/**
 * GET /api/home-featured — Devuelve solo los recursos destacados para la home page.
 * Optimizado: limita a 4 gratuitos + 4 premium, evita cargar el catálogo completo.
 * Uses short TTL cache (30s) to reduce DB load under repeated requests.
 */
export async function GET(request: Request) {
  try {
    const rateLimited = await enforceRateLimit(request, 'home-featured', 30)
    if (rateLimited) return rateLimited

    const session = await getSession().catch(() => null)
    const isAdmin = session?.role === 'admin'

    // Non-admins can use the shared cache
    if (!isAdmin && featuredCache && Date.now() - featuredCache.ts < CACHE_TTL) {
      return NextResponse.json(featuredCache.data)
    }

    const where = isAdmin ? {} : { isActive: true, area: { isActive: true } }

    const select = {
      id: true, title: true, description: true, previewPath: true,
      resourceType: true, isFree: true, priceClp: true, promoFreeUntil: true,
      courseId: true, areaId: true, subareaId: true, downloadsCount: true, isActive: true,
      course: { select: { name: true, slug: true } },
      area: { select: { name: true, slug: true } },
      subarea: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true } } } },
    } as const

    const [free, premium] = await Promise.all([
      prisma.resource.findMany({ where: { ...where, isFree: true }, select, orderBy: { downloadsCount: 'desc' }, take: 4 }),
      prisma.resource.findMany({ where: { ...where, isFree: false }, select, orderBy: { downloadsCount: 'desc' }, take: 4 }),
    ])

    const data = {
      free: free.map(mapResource),
      premium: premium.map(mapResource),
    }

    if (!isAdmin) {
      featuredCache = { data, ts: Date.now() }
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    logger.error('Error al obtener recursos destacados', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener recursos' }, { status: 500 })
  }
}
