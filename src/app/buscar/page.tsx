'use client'

import { SearchBar } from '@/components/SearchBar'
import { ResourceCard } from '@/components/ResourceCard'
import { normalizeText, expandSearchQuery } from '@/lib/utils'
import { useCatalog } from '@/lib/hooks'
import { useAuth } from '@/context/AuthContext'
import type { CatalogResource } from '@/lib/data'

export default function SearchPage({ searchParams }: { searchParams: { q?: string; area?: string; gratis?: string; premium?: string } }) {
  const { resources: allResources, loading, refresh, updateResource } = useCatalog()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const query = searchParams.q || ''
  const areaSlug = searchParams.area
  const gratisFilter = searchParams.gratis === 'true'
  const premiumFilter = searchParams.premium === 'true'

  const queries = query ? expandSearchQuery(normalizeText(query)) : []

  const visibleResources = allResources.filter((r: CatalogResource) => isAdmin || r.isActive !== false)

  let results = query
    ? visibleResources.filter((r: CatalogResource) => {
        const nTitle = normalizeText(r.title)
        const nDesc = normalizeText(r.description)
        const nCourse = normalizeText(r.courseName || '')
        const nTags = (r.tags || []).map((t: string) => normalizeText(t))
        return queries.some(q =>
          nTitle.includes(q) || nDesc.includes(q) || nCourse.includes(q) ||
          nTags.some((t: string) => t.includes(q))
        )
      })
    : visibleResources

  let suggestions: CatalogResource[] = []

  if (query) {
    const resultTagSet = new Set(results.flatMap((r: CatalogResource) => r.tags || []))
    const resultIds = new Set(results.map((r: CatalogResource) => r.id))
    suggestions = visibleResources.filter((r: CatalogResource) =>
      !resultIds.has(r.id) &&
      (r.tags || []).some((t: string) => resultTagSet.has(t))
    ).slice(0, 8)
  }

  if (areaSlug) {
    results = results.filter((r: CatalogResource) => r.areaSlug === areaSlug)
    suggestions = suggestions.filter((r: CatalogResource) => r.areaSlug === areaSlug)
  }
  if (gratisFilter) {
    results = results.filter((r: CatalogResource) => r.isFree)
    suggestions = suggestions.filter((r: CatalogResource) => r.isFree)
  }
  if (premiumFilter) {
    results = results.filter((r: CatalogResource) => !r.isFree)
    suggestions = suggestions.filter((r: CatalogResource) => !r.isFree)
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
                {results.map((r: CatalogResource) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />)}
              </div>

              {suggestions.length > 0 && (
                <>
                  <h2 className="section-title mt-12 mb-4">Te puede interesar</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {suggestions.map((r: CatalogResource) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />)}
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
