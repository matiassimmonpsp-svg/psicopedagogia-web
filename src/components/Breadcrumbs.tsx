import Link from 'next/link'
import Script from 'next/script'
import { SITE_URL } from '@/lib/site-url'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

/** Breadcrumbs visible + JSON-LD BreadcrumbList para SEO */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ label: 'Inicio', href: '/' }, ...items]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Migas de pan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          {allItems.map((item, i) => {
            const isLast = i === allItems.length - 1
            return (
              <li key={item.href || item.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-400" aria-hidden="true">/</span>}
                {isLast || !item.href ? (
                  <span className="text-gray-900 font-medium" aria-current="page">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-primary-600 transition-colors">{item.label}</Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
