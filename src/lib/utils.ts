import type { Resource } from './data'

export function formatClp(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

export function hasActivePromo(resource: Resource | null | undefined): boolean {
  if (!resource?.promoFreeUntil) return false
  return new Date(resource.promoFreeUntil) > new Date()
}

export function getPromoEndDate(resource: Resource | null | undefined): Date | null {
  if (!resource?.promoFreeUntil) return null
  const d = new Date(resource.promoFreeUntil)
  return d > new Date() ? d : null
}

export function normalizeText(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const wordToNum: Record<string, string> = {
  'pre-kinder': 'prekinder',
  primero: '1°', segundo: '2°', tercero: '3°', cuarto: '4°',
  quinto: '5°', sexto: '6°', septimo: '7°', octavo: '8°',
}

export function expandSearchQuery(q: string): string[] {
  const seen = new Set<string>()
  const results: string[] = [q]
  const words = q.split(/\s+/)
  for (const w of words) {
    const mapped = wordToNum[w]
    if (mapped) {
      const alt = q.replace(w, mapped)
      if (!seen.has(alt)) { seen.add(alt); results.push(alt) }
    }
  }
  return results
}

export async function upsertTags(tags: string, resourceId: string, prismaClient: typeof import('@/lib/prisma').prisma): Promise<void> {
  const tagNames = String(tags).split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean)
  for (const name of tagNames) {
    const slug = name.replace(/\s+/g, '-')
    let tag = await prismaClient.tag.findUnique({ where: { slug } })
    if (!tag) tag = await prismaClient.tag.create({ data: { name, slug } })
    await prismaClient.resourceTag.create({ data: { resourceId, tagId: tag.id } }).catch(() => {})
  }
}