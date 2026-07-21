import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { courses } from '@/lib/data'
import { logger } from '@/lib/logger'
import { SITE_URL } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/catalogo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/material-educativo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/comunidad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/buscar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/registro`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const coursePages: MetadataRoute.Sitemap = courses.map(course => ({
    url: `${SITE_URL}/cursos/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  let resourcePages: MetadataRoute.Sitemap = []
  try {
    const resources = await prisma.resource.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    })
    resourcePages = resources.map(r => ({
      url: `${SITE_URL}/recurso/${r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (err: unknown) {
    logger.warn('Error al generar URLs de recursos para sitemap', { error: err instanceof Error ? err.message : err })
  }

  return [...staticPages, ...coursePages, ...resourcePages]
}
