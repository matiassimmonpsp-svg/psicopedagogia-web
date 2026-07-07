'use client'

import { useEffect, useState, useCallback } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { ResourceCard } from '@/components/ResourceCard'
import { areas } from '@/lib/data'
import type { Resource } from '@/lib/data'

export default function SearchPage({ searchParams }: { searchParams: { q?: string; area?: string; gratis?: string; premium?: string } }) {
  const [allResources, setAllResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/catalog')
      const data = await res.json()
      setAllResources(data.resources || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchResources() }, [fetchResources])

  const query = searchParams.q || ''
  const areaFilter = searchParams.area
  const gratisFilter = searchParams.gratis === 'true'
  const premiumFilter = searchParams.premium === 'true'

  let results = query
    ? allResources.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : allResources

  let suggestions: Resource[] = []

  if (query) {
    const resultTagSet = new Set(results.flatMap(r => r.tags))
    const resultIds = new Set(results.map(r => r.id))
    suggestions = allResources.filter(r =>
      !resultIds.has(r.id) &&
      r.tags.some(t => resultTagSet.has(t))
    ).slice(0, 8)
  }

  if (areaFilter) {
    const area = areas.find(a => a.slug === areaFilter)
    if (area) {
      results = results.filter(r => r.areaId === area.id)
      suggestions = suggestions.filter(r => r.areaId === area.id)
    }
  }
  if (gratisFilter) {
    results = results.filter(r => r.isFree)
    suggestions = suggestions.filter(r => r.isFree)
  }
  if (premiumFilter) {
    results = results.filter(r => !r.isFree)
    suggestions = suggestions.filter(r => !r.isFree)
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
                {results.map(r => <ResourceCard key={r.id} resource={r} onUpdate={fetchResources} />)}
              </div>

              {suggestions.length > 0 && (
                <>
                  <h2 className="section-title mt-12 mb-4">Te puede interesar</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {suggestions.map(r => <ResourceCard key={r.id} resource={r} onUpdate={fetchResources} />)}
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
