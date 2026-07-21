'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ResourceCard } from '@/components/ResourceCard'
import { useCatalog } from '@/lib/hooks'
import { useAuth } from '@/context/AuthContext'
import { courses } from '@/lib/data'
import { Search, X } from 'lucide-react'
import type { Resource } from '@/lib/data'

interface SearchParams {
  q?: string
  area?: string
  gratis?: string
  premium?: string
}

export default function SearchPageClient({ searchParams }: { searchParams: SearchParams }) {
  const { resources: allResources, loading: catalogLoading, refresh, updateResource } = useCatalog()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const query = searchParams.q || ''
  const areaSlug = searchParams.area
  const gratisFilter = searchParams.gratis === 'true'
  const premiumFilter = searchParams.premium === 'true'

  const [courseSlug, setCourseSlug] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Resource[]>([])
  const [suggestions, setSuggestions] = useState<Resource[]>([])
  const [searching, setSearching] = useState(false)

  const performSearch = useCallback(async () => {
    if (!query && !areaSlug && !gratisFilter && !premiumFilter) {
      setSearchResults([])
      setSuggestions([])
      return
    }

    setSearching(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (areaSlug) params.set('area', areaSlug)
      if (gratisFilter) params.set('gratis', 'true')
      if (premiumFilter) params.set('premium', 'true')

      const res = await fetch(`/api/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.results || [])
        setSuggestions(data.suggestions || [])
      }
    } catch {
      const visibleResources = allResources.filter((r: Resource) => isAdmin || r.isActive !== false)
      setSearchResults(visibleResources.slice(0, 50))
    } finally {
      setSearching(false)
    }
  }, [query, areaSlug, gratisFilter, premiumFilter, allResources, isAdmin])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const showFullCatalog = !query && !areaSlug && !gratisFilter && !premiumFilter
  const displayResources = showFullCatalog ? allResources : searchResults

  const visibleResources = useMemo(() => displayResources.filter((r: Resource) => {
    if (!isAdmin && r.isActive === false) return false
    if (courseSlug && r.courseSlug !== courseSlug) return false
    if (typeFilter && r.resourceType !== typeFilter) return false
    if (sidebarSearch) {
      const q = sidebarSearch.toLowerCase()
      const matchTitle = r.title.toLowerCase().includes(q)
      const matchDesc = r.description?.toLowerCase().includes(q)
      const matchCourse = r.courseName?.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc && !matchCourse) return false
    }
    return true
  }), [displayResources, isAdmin, courseSlug, typeFilter, sidebarSearch])

  const hasSidebarFilters = courseSlug || typeFilter || sidebarSearch

  function clearSidebarFilters() {
    setCourseSlug(null)
    setTypeFilter(null)
    setSidebarSearch('')
  }

  const activeFilterCount = [courseSlug, typeFilter].filter(Boolean).length + (sidebarSearch ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Buscar recursos</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 space-y-6">
            <div>
              <label htmlFor="sidebar-search" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Search size={16} /> Buscar
              </label>
              <input
                id="sidebar-search"
                type="text"
                data-testid="search-sidebar-input"
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
                placeholder="Título, descripción..."
                className="input w-full text-sm py-2.5 border-2 border-gray-300 focus:border-primary-500 rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Curso</p>
              <div data-testid="search-course-filters" className="space-y-1 max-h-48 overflow-y-auto">
                {courses.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => setCourseSlug(courseSlug === c.slug ? null : c.slug)}
                    aria-pressed={courseSlug === c.slug}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      courseSlug === c.slug ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Tipo</p>
              <div data-testid="search-type-filters" className="flex gap-2">
                {[
                  { value: 'evaluation', label: 'Evaluación' },
                  { value: 'educational', label: 'Material' },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(typeFilter === t.value ? null : t.value)}
                    aria-pressed={typeFilter === t.value}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      typeFilter === t.value ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {hasSidebarFilters && (
              <button
                onClick={clearSidebarFilters}
                className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-red-600 py-2 transition-colors"
              >
                <X size={14} /> Limpiar filtros ({activeFilterCount})
              </button>
            )}
          </div>
        </aside>

        <div data-testid="search-results" className="flex-1 min-w-0">
          {(searching && searchResults.length === 0 && !showFullCatalog) || (showFullCatalog && catalogLoading) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-xl" /></div>)}
            </div>
          ) : (
            <>
              {query && (
                <p className="text-sm text-gray-500 mb-6">
                  {visibleResources.length} resultado{visibleResources.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
                </p>
              )}

              {visibleResources.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No se encontraron resultados.</p>
                  <p className="text-gray-500 text-sm mt-1">Intenta con otros términos o explora por curso.</p>
                  {hasSidebarFilters && (
                    <button onClick={clearSidebarFilters} className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {query && <h2 className="section-title mb-4">Resultados</h2>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {visibleResources.map((r: Resource) => (
                      <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />
                    ))}
                  </div>

                  {suggestions.length > 0 && (
                    <>
                      <h2 className="section-title mt-12 mb-4">Te puede interesar</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {suggestions.map((r: Resource) => (
                          <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
