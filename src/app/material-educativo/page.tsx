import type { Metadata } from 'next'
import EducationalMaterialPageClient from './EducationalMaterialPage'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Material Educativo',
  description: 'Fichas de apoyo, cuadernillos y recursos didácticos complementarios para el aula. Material educativo para el sistema escolar chileno.',
  alternates: { canonical: '/material-educativo' },
  openGraph: {
    title: 'Material Educativo | Psicopedagogía Chile',
    description: 'Fichas de apoyo, cuadernillos y recursos didácticos complementarios para el aula.',
  },
}

export default function EducationalMaterialPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Material Educativo' }]} />
      <EducationalMaterialPageClient />
    </>
  )
}
