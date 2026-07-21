import type { Metadata } from 'next'
import CatalogoPageClient from './CatalogoPage'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Catálogo de Recursos',
  description: 'Explora nuestro catálogo de instrumentos de evaluación psicopedagógica y material educativo. Filtra por curso, área y tipo de recurso.',
  alternates: { canonical: '/catalogo' },
  openGraph: {
    title: 'Catálogo de Recursos | Psicopedagogía Chile',
    description: 'Instrumentos de evaluación psicopedagógica y material educativo para el sistema escolar chileno.',
  },
}

export default function CatalogoPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Catálogo' }]} />
      <CatalogoPageClient />
    </>
  )
}
