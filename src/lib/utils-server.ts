// ============================================================
// Utilidades del backend (solo servidor)
// ============================================================

import type { PrismaClient } from '@prisma/client'
import { generateSlug } from '@/lib/utils'

/** Crea las relaciones ResourceTag para un recurso dado (batch optimizado) */
export async function upsertTags(
  tags: string[],
  resourceId: string,
  prismaClient: PrismaClient
): Promise<void> {
  const slugs = tags.map(t => generateSlug(t))
  const existing = await prismaClient.tag.findMany({ where: { slug: { in: slugs } } })
  const existingMap = new Map(existing.map(t => [t.slug, t.id]))

  const newSlugs = slugs.filter(s => !existingMap.has(s))
  if (newSlugs.length > 0) {
    const created = await prismaClient.tag.createMany({
      data: newSlugs.map(slug => ({
        name: tags[slugs.indexOf(slug)],
        slug,
      })),
      skipDuplicates: true,
    })
    // Fetch back the created tags to get their IDs
    if (created.count > 0) {
      const freshTags = await prismaClient.tag.findMany({ where: { slug: { in: newSlugs } } })
      for (const t of freshTags) {
        existingMap.set(t.slug, t.id)
      }
    }
  }

  const tagIds = slugs.map(s => existingMap.get(s)!).filter(Boolean)
  await prismaClient.resourceTag.createMany({
    data: tagIds.map(tagId => ({ resourceId, tagId })),
    skipDuplicates: true,
  })
}