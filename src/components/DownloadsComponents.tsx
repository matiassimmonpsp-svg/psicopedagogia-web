'use client'

import { Search, X, BookOpen, ExternalLink, Clock, AlertTriangle, Download, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'
import { courses, areas } from '@/lib/data'

import type { DownloadItem } from '@/lib/data'

// ============================================================
// Componente: Filtros laterales
// ============================================================
interface DownloadsFiltersProps {
  search: string
  setSearch: (v: string) => void
  typeFilter: string | null
  setTypeFilter: (v: string | null) => void
  courseFilter: string | null
  setCourseFilter: (v: string | null) => void
  areaFilter: string | null
  setAreaFilter: (v: string | null) => void
  resourceTypeFilter: string | null
  setResourceTypeFilter: (v: string | null) => void
  sortOrder: 'recent' | 'oldest'
  setSortOrder: (v: 'recent' | 'oldest') => void
  hasFilters: boolean
  activeFilterCount: number
  clearFilters: () => void
}

export function DownloadsFilters({
  search, setSearch,
  typeFilter, setTypeFilter,
  courseFilter, setCourseFilter,
  areaFilter, setAreaFilter,
  resourceTypeFilter, setResourceTypeFilter,
  sortOrder, setSortOrder,
  hasFilters, activeFilterCount, clearFilters,
}: DownloadsFiltersProps) {
  return (
    <aside className="lg:w-64 shrink-0">
      <div className="card p-5 space-y-6">
        <div>
          <label htmlFor="downloads-search" className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <Search size={13} /> Buscar
          </label>
          <input
            id="downloads-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Título o curso..."
            className="input w-full text-sm"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de descarga</p>
          <div className="space-y-1">
            {[
              { value: null, label: 'Todos' },
              { value: 'purchased', label: 'Comprados' },
              { value: 'free', label: 'Gratis' },
            ].map(t => (
              <button
                key={t.label}
                onClick={() => setTypeFilter(t.value)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  typeFilter === t.value ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Curso</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {courses.map(c => (
              <button
                key={c.slug}
                onClick={() => setCourseFilter(courseFilter === c.slug ? null : c.slug)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  courseFilter === c.slug ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Área</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {areas.map(a => (
              <button
                key={a.slug}
                onClick={() => setAreaFilter(areaFilter === a.slug ? null : a.slug)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  areaFilter === a.slug ? 'bg-secondary-100 text-secondary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de material</p>
          <div className="flex gap-2">
            {[
              { value: 'evaluation', label: 'Evaluación' },
              { value: 'educational', label: 'Material' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setResourceTypeFilter(resourceTypeFilter === t.value ? null : t.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  resourceTypeFilter === t.value ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ordenar por</p>
          <div className="space-y-1">
            <button
              onClick={() => setSortOrder('recent')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortOrder === 'recent' ? 'bg-gray-200 text-gray-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Más recientes
            </button>
            <button
              onClick={() => setSortOrder('oldest')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortOrder === 'oldest' ? 'bg-gray-200 text-gray-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Más antiguos
            </button>
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
  )
}

// ============================================================
// Componente: Fila de item de descarga
// ============================================================
interface ItemRowProps {
  item: DownloadItem
  downloadingId: string | null
  onDownload: (item: DownloadItem) => void
}

export function DownloadItemRow({ item, downloadingId, onDownload }: ItemRowProps) {
  const isDownloading = downloadingId === item.id
  const isPurchased = item.type === 'purchased'
  const isResourcePaused = item.isActive === false
  const isAreaPaused = item.areaIsActive === false
  const isPaused = isResourcePaused || isAreaPaused

  return (
    <div className={`card p-5 flex items-center justify-between gap-4 ${isPaused ? 'border-amber-200 bg-amber-50/50' : ''}`}>
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isPaused ? 'bg-amber-100' : isPurchased ? 'bg-primary-100' : 'bg-emerald-100'}`}>
          {isPaused
            ? <AlertTriangle size={24} className="text-amber-600" />
            : isPurchased
              ? <FileText size={24} className="text-primary-600" />
              : <BookOpen size={24} className="text-emerald-600" />
          }
        </div>
        <div className="min-w-0">
          <h3 className={`text-base font-medium truncate ${isPaused ? 'text-amber-800' : 'text-gray-900'}`}>{item.title}</h3>
          <p className={`text-sm flex items-center gap-1.5 mt-0.5 ${isPaused ? 'text-amber-600' : 'text-gray-500'}`}>
            <Clock size={13} />
            {new Date(item.date).toLocaleDateString('es-CL', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
            {item.courseName && (
              <>
                <span className="text-gray-300">·</span>
                {item.courseName}
              </>
            )}
          </p>
          {isPaused && (
            <p className="text-xs text-amber-600 mt-1 font-medium">
              {isResourcePaused
                ? 'Recurso en revisión — Volverá a estar disponible pronto.'
                : 'Área temporalmente no disponible — Volverá a estar disponible pronto.'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/recurso/${item.resourceId}`}
          target="_blank"
          className="btn-secondary inline-flex items-center gap-1.5"
        >
          <ExternalLink size={16} /> Ver
        </Link>
        {isPaused ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg border border-amber-200 cursor-not-allowed">
            <AlertTriangle size={16} /> No disponible
          </span>
        ) : (
          <button
            onClick={() => onDownload(item)}
            disabled={downloadingId === item.id}
            className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {downloadingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {downloadingId === item.id ? 'Descargando...' : 'Descargar'}
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Componente: Estado vacío
// ============================================================
interface DownloadsEmptyProps {
  hasFilters: boolean
  activeFilterCount: number
  clearFilters: () => void
  onExplore: () => void
}

export function DownloadsEmpty({ hasFilters, activeFilterCount, clearFilters, onExplore }: DownloadsEmptyProps) {
  if (hasFilters) {
    return (
      <div className="card p-10 text-center">
        <Search size={56} className="mx-auto text-gray-300 mb-5" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin resultados</h2>
        <p className="text-gray-500 mb-6">Ninguna descarga coincide con los filtros.</p>
        <button onClick={clearFilters} className="btn-secondary">Limpiar filtros</button>
      </div>
    )
  }

  return (
    <div className="card p-12 text-center">
      <Download size={64} className="mx-auto text-gray-300 mb-5" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes descargas aún</h2>
      <p className="text-gray-500 mb-6">Los recursos que compres o descargues gratis aparecerán aquí.</p>
      <button onClick={onExplore} className="btn-primary inline-flex items-center gap-2">Explorar recursos</button>
    </div>
  )
}

// ============================================================
// Componente: Sección de descargas (Comprados / Gratis)
// ============================================================
interface DownloadsSectionProps {
  title: string
  count: number
  icon: React.ReactNode
  iconColor: string
  items: DownloadItem[]
  downloadingId: string | null
  onDownload: (item: DownloadItem) => void
}

export function DownloadsSection({ title, count, icon, iconColor, items, downloadingId, onDownload }: DownloadsSectionProps) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
        <span style={{ color: iconColor }}>{icon}</span> {title}
        <span className="text-sm font-normal text-gray-400">({count})</span>
      </h2>
      <div className="space-y-3">
        {items.map(d => (
          <DownloadItemRow key={d.id} item={d} downloadingId={downloadingId} onDownload={onDownload} />
        ))}
      </div>
    </section>
  )
}

// ============================================================
// Componente: Loading skeleton
// ============================================================
export function DownloadsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
      <div className="h-10 w-56 bg-gray-100 rounded-lg animate-pulse mb-3" />
      <div className="h-6 w-72 bg-gray-100 rounded animate-pulse mb-10" />
      <div className="h-12 bg-gray-100 rounded-lg animate-pulse mb-8" />
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse mb-3" />
      ))}
    </div>
  )
}