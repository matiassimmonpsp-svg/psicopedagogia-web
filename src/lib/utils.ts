/** Normaliza texto: minúsculas, sin tildes, sin caracteres especiales */
export function normalizeText(t: string): string {
  return t.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
}

/** Expande una consulta de búsqueda en tokens individuales */
export function expandSearchQuery(query: string): string[] {
  return normalizeText(query).split(/\s+/).filter(Boolean)
}

/** Formatea un número como pesos chilenos (CLP) */
export function formatClp(valor: number): string {
  return `$${Math.round(valor).toLocaleString('es-CL')}`
}

/** Verifica si un recurso tiene una promoción activa */
export function hasActivePromo(resource: { promoFreeUntil?: string | Date | null }): boolean {
  if (!resource.promoFreeUntil) return false
  return new Date(resource.promoFreeUntil) > new Date()
}

/** Devuelve la fecha de término de la promo, o null si ya expiró */
export function getPromoEndDate(promoFreeUntil: string | Date | null): Date | null {
  if (!promoFreeUntil) return null
  const date = new Date(promoFreeUntil)
  return date > new Date() ? date : null
}

/** Descarga un archivo desde una URL y lo guarda con el nombre indicado */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url)
  if (res.status === 401) throw new Error('No autorizado')
  if (res.status === 403) throw new Error('Debes comprar este recurso para descargarlo')
  if (!res.ok) throw new Error(await res.json().then(d => d.error).catch(() => 'Error al descargar'))
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}

/** Crea las relaciones ResourceTag para un recurso dado (batch optimizado) */
export async function upsertTags(tags: string[], resourceId: string, prismaClient: { tag: { findMany: (args: { where: { slug: { in: string[] } } }) => Promise<Array<{ id: number; slug: string }>>; create: (args: { data: { name: string; slug: string } }) => Promise<{ id: number }> }; resourceTag: { createMany: (args: { data: Array<{ resourceId: string; tagId: number }>; skipDuplicates: boolean }) => Promise<unknown> } }) {
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
