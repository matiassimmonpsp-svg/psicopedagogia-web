'use client'

import { SearchBar } from '@/components/SearchBar'
import { ResourceCard } from '@/components/ResourceCard'
import { normalizeText, expandSearchQuery } from '@/lib/utils'
import { useCatalog } from '@/lib/hooks'

export default function SearchPage({ searchParams }: { searchParams: { q?: string; area?: string; gratis?: string; premium?: string } }) {
  const { resources: allResources, loading, refresh } = useCatalog()

  const query = searchParams.q || ''
  const areaSlug = searchParams.area
  const gratisFilter = searchParams.gratis === 'true'
  const premiumFilter = searchParams.premium === 'true'

  const queries = query ? expandSearchQuery(normalizeText(query)) : []

  let results = query
    ? allResources.filter((r: any) => {
        const nTitle = normalizeText(r.title)
        const nDesc = normalizeText(r.description)
        const nCourse = normalizeText(r.courseName || '')
        const nTags = (r.tags || []).map((t: string) => normalizeText(t))
        return queries.some(q =>
          nTitle.includes(q) || nDesc.includes(q) || nCourse.includes(q) ||
          nTags.some((t: string) => t.includes(q))
        )
      })
    : allResources

  let suggestions: any[] = []

  if (query) {
    const resultTagSet = new Set(results.flatMap((r: any) => r.tags || []))
    const resultIds = new Set(results.map((r: any) => r.id))
    suggestions = allResources.filter((r: any) =>
      !resultIds.has(r.id) &&
      (r.tags || []).some((t: string) => resultTagSet.has(t))
    ).slice(0, 8)
  }

  if (areaSlug) {
    results = results.filter((r: any) => r.areaSlug === areaSlug)
    suggestions = suggestions.filter((r: any) => r.areaSlug === areaSlug)
  }
  if (gratisFilter) {
    results = results.filter((r: any) => r.isFree)
    suggestions = suggestions.filter((r: any) => r.isFree)
  }
  if (premiumFilter) {
    results = results.filter((r: any) => !r.isFree)
    suggestions = suggestions.filter((r: any) => !r.isFree)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Buscar recursos</h1>
      <div className="max-w-2xl mb-8">
        <SearchBar large />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-xl" /></div>)}
        </div>
      ) : (
        <>
          {query && (
            <p className="text-sm text-gray-500 mb-6">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
            </p>
          )}

          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No se encontraron resultados.</p>
              <p className="text-gray-400 text-sm mt-1">Intenta con otros términos o explora por curso.</p>
            </div>
          ) : (
            <>
              {query && <h2 className="section-title mb-4">Resultados</h2>}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((r: any) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} />)}
              </div>

              {suggestions.length > 0 && (
                <>
                  <h2 className="section-title mt-12 mb-4">Te puede interesar</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {suggestions.map((r: any) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} />)}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
