'use client'

import { useState } from 'react'
import { ResourceCard } from '@/components/ResourceCard'
import { courses, areas, type Resource } from '@/lib/data'
import { normalizeText, expandSearchQuery } from '@/lib/utils'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCatalog } from '@/lib/hooks'
import { useAuth } from '@/context/AuthContext'

const ITEMS_PER_PAGE = 12

export default function CatalogoPage() {
  const { resources: allResources, loading, refresh, updateResource } = useCatalog()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [courseSlug, setCourseSlug] = useState<string | null>(null)
  const [areaSlug, setAreaSlug] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [priceFilter, setPriceFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const hasFilters = courseSlug || areaSlug || typeFilter || priceFilter || searchQuery

  const results = allResources.filter((r: Resource) => {
    if (!isAdmin && r.isActive === false) return false
    if (courseSlug && r.courseSlug !== courseSlug) return false
    if (areaSlug && r.areaSlug !== areaSlug) return false
    if (typeFilter && r.resourceType !== typeFilter) return false
    if (priceFilter === 'free' && !r.isFree) return false
    if (priceFilter === 'premium' && r.isFree) return false
    if (searchQuery) {
      const queries = expandSearchQuery(normalizeText(searchQuery))
      const nTitle = normalizeText(r.title)
      const nDesc = normalizeText(r.description)
      const nCourse = normalizeText(r.courseName || '')
      const nTags = (r.tags || []).map((t: string) => normalizeText(t))
      if (!queries.some(q => nTitle.includes(q) || nDesc.includes(q) || nCourse.includes(q) || nTags.some((t: string) => t.includes(q)))) return false
    }
    return true
  })

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE)
  const paginatedResults = results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  function clearFilters() {
    setCourseSlug(null)
    setAreaSlug(null)
    setTypeFilter(null)
    setPriceFilter(null)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const activeFilterCount = [courseSlug, areaSlug, typeFilter, priceFilter].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Recursos</h1>
        <p className="text-gray-500">Explora todos nuestros instrumentos de evaluación y material educativo.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="card p-5 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Search size={16} /> Buscar
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Título, descripción o tag..."
                className="input w-full text-sm"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Curso</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {courses.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      setCourseSlug(courseSlug === c.slug ? null : c.slug)
                      setCurrentPage(1)
                    }}
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
              <p className="text-sm font-semibold text-gray-700 mb-2">Área</p>
              <div className="space-y-1">
                {areas.map(a => (
                  <button
                    key={a.slug}
                    onClick={() => {
                      setAreaSlug(areaSlug === a.slug ? null : a.slug)
                      setCurrentPage(1)
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      areaSlug === a.slug ? 'bg-secondary-100 text-secondary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Tipo</p>
              <div className="flex gap-2">
                {[
                  { value: 'evaluation', label: 'Evaluación' },
                  { value: 'educational', label: 'Material' },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTypeFilter(typeFilter === t.value ? null : t.value)
                      setCurrentPage(1)
                    }}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      typeFilter === t.value ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Precio</p>
              <div className="flex gap-2">
                {[
                  { value: 'free', label: 'Gratis' },
                  { value: 'premium', label: 'Premium' },
                ].map(p => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setPriceFilter(priceFilter === p.value ? null : p.value)
                      setCurrentPage(1)
                    }}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      priceFilter === p.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-red-600 py-2 transition-colors"
              >
                <X size={14} /> Limpiar filtros ({activeFilterCount})
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {loading ? 'Cargando...' : `${results.length} recurso${results.length !== 1 ? 's' : ''}`}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium lg:hidden">
                Limpiar filtros
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-xl" /></div>)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No se encontraron recursos</p>
              <p className="text-gray-400 text-sm mt-1">Intenta cambiando los filtros</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedResults.map((r: Resource) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
