// ============================================================
// Utilidades del backend (solo servidor)
// ============================================================

import { PrismaClient } from '@prisma/client'

/** Crea las relaciones ResourceTag para un recurso dado (batch optimizado) */
export async function upsertTags(
  tags: string[],
  resourceId: string,
  prismaClient: PrismaClient
): Promise<void> {
  const slugs = tags.map(t => t.toLowerCase().replace(/\s+/g, '-'))
  const existing = await prismaClient.tag.findMany({ where: { slug: { in: slugs } } })
  const existingMap = new Map(existing.map(t => [t.slug, t.id]))

  const newSlugs = slugs.filter(s => !existingMap.has(s))
  for (const slug of newSlugs) {
    const name = tags[slugs.indexOf(slug)]
    const created = await prismaClient.tag.create({ data: { name, slug } })
    existingMap.set(slug, created.id)
  }

  const tagIds = slugs.map(s => existingMap.get(s)!).filter(Boolean)
  await prismaClient.resourceTag.createMany({
    data: tagIds.map(tagId => ({ resourceId, tagId })),
    skipDuplicates: true,
  })
}