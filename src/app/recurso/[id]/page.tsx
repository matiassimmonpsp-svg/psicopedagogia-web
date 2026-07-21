import type { Metadata } from 'next'
import Script from 'next/script'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import ResourceDetailPageClient from './ResourceDetailClient'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const revalidate = 300

type Props = { params: { id: string } }

export async function generateMetadata({ params: p }: Props): Promise<Metadata> {
  const params = await p
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: {
        title: true,
        description: true,
        isFree: true,
        priceClp: true,
        previewPath: true,
        course: { select: { name: true } },
        area: { select: { name: true } },
      },
    })

    if (!resource) {
      return { title: 'Recurso no encontrado', robots: { index: false } }
    }

    const title = `${resource.title} | Psicopedagogía Chile`
    const desc = resource.description?.slice(0, 160) || `Recurso de evaluación psicopedagógica: ${resource.title}`

    return {
      title,
      description: desc,
      alternates: { canonical: `/recurso/${params.id}` },
      openGraph: {
        title,
        description: desc,
        images: resource.previewPath ? [{ url: resource.previewPath, width: 800, height: 600 }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
      },
    }
  } catch (err: unknown) {
    logger.warn('Error al generar metadata del recurso', { error: err instanceof Error ? err.message : err })
    return { title: 'Recurso', robots: { index: false } }
  }
}

export default async function ResourceDetailPage({ params: p }: Props) {
  const params = await p
  let jsonLd = null
  let courseSlug = ''
  let courseName = ''
  let resourceTitle = ''
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: {
        id: true, title: true, description: true, isFree: true, priceClp: true,
        previewPath: true, course: { select: { name: true, slug: true } },
      },
    })
    if (resource) {
      courseSlug = resource.course?.slug || ''
      courseName = resource.course?.name || ''
      resourceTitle = resource.title
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: resource.title,
        description: resource.description?.slice(0, 300),
        image: resource.previewPath || undefined,
        brand: { '@type': 'Organization', name: 'Psicopedagogía Chile' },
        offers: resource.isFree
          ? { '@type': 'Offer', price: '0', priceCurrency: 'CLP', availability: 'https://schema.org/InStock' }
          : { '@type': 'Offer', price: resource.priceClp || 0, priceCurrency: 'CLP', availability: 'https://schema.org/InStock' },
      }
    }
  } catch (err: unknown) {
    logger.warn('Error al generar JSON-LD del recurso', { error: err instanceof Error ? err.message : err })
  }

  const crumbs = [
    { label: 'Catálogo', href: '/catalogo' },
    ...(courseSlug ? [{ label: courseName, href: `/cursos/${courseSlug}` }] : []),
    ...(resourceTitle ? [{ label: resourceTitle }] : []),
  ]

  return (
    <>
      {jsonLd && <Script id="product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <Breadcrumbs items={crumbs} />
      <ResourceDetailPageClient />
    </>
  )
}
