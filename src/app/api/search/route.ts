import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

interface RawSearchResult {
  id: string
  title: string
  description: string
  preview_path: string
  resource_type: string
  is_free: boolean
  price_clp: number | null
  promo_free_until: Date | null
  course_id: number
  area_id: number
  subarea_id: number | null
  downloads_count: number
  is_active: boolean
  course_name: string
  course_slug: string
  area_name: string
  area_slug: string
  subarea_name: string | null
  subarea_slug: string | null
  tags: string
}

function mapSearchResult(r: RawSearchResult, ownedIds: Set<string>) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    previewPath: r.preview_path,
    resourceType: r.resource_type,
    isFree: r.is_free,
    priceClp: r.price_clp,
    promoFreeUntil: r.promo_free_until?.toISOString?.() || r.promo_free_until,
    courseId: r.course_id,
    areaId: r.area_id,
    subareaId: r.subarea_id,
    downloadsCount: r.downloads_count,
    isActive: r.is_active,
    courseName: r.course_name,
    courseSlug: r.course_slug,
    areaName: r.area_name,
    areaSlug: r.area_slug,
    subareaName: r.subarea_name || null,
    subareaSlug: r.subarea_slug || null,
    tags: r.tags ? r.tags.split(',').filter(Boolean) : [],
    isOwned: ownedIds.has(r.id),
  }
}

function buildTsQuery(q: string): string {
  return q
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(term => `${term}:*`)
    .join(' & ')
}

function buildWhereClause(
  tsQuery: string,
  areaSlug: string | null,
  gratis: boolean,
  premium: boolean,
  isAdmin: boolean,
): { clause: string; params: unknown[] } {
  let whereConditions: string[] = []
  let params: unknown[] = []
  let paramIndex = 1

  if (tsQuery) {
    whereConditions.push(`(
      setweight(to_tsvector('spanish', coalesce(r.title, '')), 'A') ||
      setweight(to_tsvector('spanish', coalesce(r.description, '')), 'B') ||
      setweight(to_tsvector('spanish', coalesce(c.name, '')), 'B')
    ) @@ plainto_tsquery('spanish', $${paramIndex})`)
    params.push(tsQuery)
    paramIndex++
  }

  if (areaSlug) {
    whereConditions.push(`a.slug = $${paramIndex}`)
    params.push(areaSlug)
    paramIndex++
  }
  if (gratis) whereConditions.push(`r.is_free = true`)
  if (premium) whereConditions.push(`r.is_free = false`)
  if (!isAdmin) whereConditions.push(`r.is_active = true`)

  const clause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : ''

  return { clause, params }
}

async function getOwnedIds(userId: string): Promise<Set<string>> {
  const ownedItems = await prisma.orderItem.findMany({
    where: { order: { userId, status: 'completed' } },
    select: { resourceId: true },
  })
  return new Set(ownedItems.map(i => i.resourceId))
}

async function getSuggestions(
  q: string,
  mappedResults: ReturnType<typeof mapSearchResult>[],
  ownedIds: Set<string>,
): Promise<ReturnType<typeof mapSearchResult>[]> {
  if (!q || mappedResults.length === 0) return []

  const resultTagSet = new Set(mappedResults.flatMap(r => r.tags))
  if (resultTagSet.size === 0) return []

  const tagArray = Array.from(resultTagSet)
  const resultIds = new Set(mappedResults.map(r => r.id))

  const suggestionsQuery = `
    SELECT
      r.id, r.title, r.description, r.preview_path,
      r.resource_type, r.is_free, r.price_clp, r.promo_free_until,
      r.course_id, r.area_id, r.subarea_id, r.downloads_count, r.is_active,
      c.name as course_name, c.slug as course_slug,
      a.name as area_name, a.slug as area_slug,
      coalesce(string_agg(DISTINCT t2.name, ','), '') as tags
    FROM resources r
    JOIN courses c ON c.id = r.course_id
    JOIN areas a ON a.id = r.area_id
    LEFT JOIN subareas sa ON sa.id = r.subarea_id
    JOIN resource_tags rt2 ON rt2.resource_id = r.id
    JOIN tags t2 ON t2.id = rt2.tag_id
    LEFT JOIN resource_tags rt3 ON rt3.resource_id = r.id
    LEFT JOIN tags t3 ON t3.id = rt3.tag_id
    WHERE t3.name = ANY($1)
    AND r.id != ALL($2)
    AND r.is_active = true
    GROUP BY r.id, r.downloads_count, c.name, c.slug, a.name, a.slug
    ORDER BY r.downloads_count DESC
    LIMIT 8
  `
  const suggestionResults = await prisma.$queryRawUnsafe(suggestionsQuery, tagArray, Array.from(resultIds)) as RawSearchResult[]
  return suggestionResults.map(r => mapSearchResult(r, ownedIds))
}

/**
 * GET /api/search?q=...&area=...&gratis=...&premium=...
 * Búsqueda full-text con PostgreSQL tsvector.
 */
export async function GET(request: Request) {
  const rateLimited = await enforceRateLimit(request, 'search', 30)
  if (rateLimited) return rateLimited

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const areaSlug = searchParams.get('area')
    const gratis = searchParams.get('gratis') === 'true'
    const premium = searchParams.get('premium') === 'true'

    if (!q && !areaSlug && !gratis && !premium) {
      return NextResponse.json({ results: [], suggestions: [] })
    }

    const session = await getSession().catch(() => null)
    const isAdmin = session?.role === 'admin'

    const tsQuery = q ? buildTsQuery(q) : ''
    const { clause: whereClause, params } = buildWhereClause(tsQuery, areaSlug, gratis, premium, isAdmin)

    const searchQuery = `
      SELECT
        r.id, r.title, r.description, r.preview_path,
        r.resource_type, r.is_free, r.price_clp, r.promo_free_until,
        r.course_id, r.area_id, r.subarea_id, r.downloads_count, r.is_active,
        c.name as course_name, c.slug as course_slug,
        a.name as area_name, a.slug as area_slug,
        sa.name as subarea_name, sa.slug as subarea_slug,
        coalesce(string_agg(DISTINCT t.name, ','), '') as tags
      FROM resources r
      JOIN courses c ON c.id = r.course_id
      JOIN areas a ON a.id = r.area_id
      LEFT JOIN subareas sa ON sa.id = r.subarea_id
      LEFT JOIN resource_tags rt ON rt.resource_id = r.id
      LEFT JOIN tags t ON t.id = rt.tag_id
      ${whereClause}
      GROUP BY r.id, r.created_at, c.name, c.slug, a.name, a.slug, sa.name, sa.slug
      ORDER BY r.created_at DESC
      LIMIT 50
    `

    const results = await prisma.$queryRawUnsafe(searchQuery, ...params) as RawSearchResult[]
    const ownedIds = session ? await getOwnedIds(session.id) : new Set<string>()
    const mappedResults = results.map(r => mapSearchResult(r, ownedIds))
    const suggestions = await getSuggestions(q, mappedResults, ownedIds)

    return NextResponse.json({ results: mappedResults, suggestions })
  } catch (err: unknown) {
    logger.error('Error en búsqueda', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 })
  }
}
