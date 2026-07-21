import type { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'

export const metadata: Metadata = {
  title: 'Buscar Recursos',
  description: 'Busca instrumentos de evaluación psicopedagógica, material educativo y recursos profesionales por nombre, área o curso.',
}

export default function SearchPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <SearchPageClient searchParams={searchParams} />
}
