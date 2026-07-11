'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Download, FileText, Clock, Loader2, Sparkles, Gift, Search, ExternalLink, BookOpen, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { courses, areas } from '@/lib/data'
import { downloadFile } from '@/lib/utils'
import type { DownloadItem } from '@/lib/data'

export default function DownloadsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [courseFilter, setCourseFilter] = useState<string | null>(null)
  const [areaFilter, setAreaFilter] = useState<string | null>(null)
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    const load = async () => {
      try {
        const res = await fetch('/api/downloads')
        if (res.ok) {
          const data = await res.json()
          setDownloads(data.downloads || [])
        }
      } catch (err) { console.error('Error al cargar descargas:', err) } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, authLoading, router])

  async function handleDownload(item: DownloadItem) {
    setDownloadingId(item.id)
    try {
      await downloadFile(`/api/download/${item.resourceId}`, `${item.title.replace(/[^a-z0-9]+/gi, '-')}.pdf`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message === 'No autorizado') { router.push('/login'); return }
      toast.error(message || 'Error de conexión')
    } finally { setDownloadingId(null) }
  }

  const filtrados = useMemo(() => {
    let result = [...downloads]

    if (typeFilter) {
      result = result.filter(d => d.type === typeFilter)
    }
    if (courseFilter) {
      result = result.filter(d => d.courseSlug === courseFilter)
    }
    if (areaFilter) {
      result = result.filter(d => d.areaSlug === areaFilter)
    }
    if (resourceTypeFilter) {
      result = result.filter(d => d.resourceType === resourceTypeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.courseName && d.courseName.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) =>
      sortOrder === 'recent'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return result
  }, [downloads, search, typeFilter, courseFilter, areaFilter, resourceTypeFilter, sortOrder])

  const hasFilters = typeFilter || courseFilter || areaFilter || resourceTypeFilter || search
  const activeFilterCount = [typeFilter, courseFilter, areaFilter, resourceTypeFilter].filter(Boolean).length
  const purchased = filtrados.filter(d => d.type === 'purchased')
  const freebies = filtrados.filter(d => d.type === 'free')

  function clearFilters() {
    setTypeFilter(null)
    setCourseFilter(null)
    setAreaFilter(null)
    setResourceTypeFilter(null)
    setSearch('')
    setSortOrder('recent')
  }

  if (authLoading || loading) {
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

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Descargas</h1>
      <p className="text-gray-500 mb-8 text-lg">Recursos que has adquirido o descargado gratis</p>

      {downloads.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <aside className="lg:w-64 shrink-0">
            <div className="card p-5 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Search size={13} /> Buscar
                </label>
                <input
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium lg:hidden">
                  Limpiar filtros
                </button>
              )}
            </div>

            {filtrados.length === 0 ? (
              <div className="card p-10 text-center">
                {search || activeFilterCount > 0 ? (
                  <>
                    <Search size={56} className="mx-auto text-gray-300 mb-5" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin resultados</h2>
                    <p className="text-gray-500 mb-6">Ninguna descarga coincide con los filtros.</p>
                    <button onClick={clearFilters} className="btn-secondary">Limpiar filtros</button>
                  </>
                ) : (
                  <>
                    <Download size={56} className="mx-auto text-gray-300 mb-5" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes descargas aún</h2>
                    <p className="text-gray-500 mb-6">Los recursos que compres o descargues gratis aparecerán aquí.</p>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar recursos</Link>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {purchased.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <Sparkles size={20} className="text-primary-500" /> Comprados
                      <span className="text-sm font-normal text-gray-400">({purchased.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {purchased.map(d => (
                        <ItemRow key={d.id} item={d} downloadingId={downloadingId} onDownload={handleDownload} />
                      ))}
                    </div>
                  </section>
                )}

                {freebies.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <Gift size={20} className="text-emerald-500" /> Gratis
                      <span className="text-sm font-normal text-gray-400">({freebies.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {freebies.map(d => (
                        <ItemRow key={d.id} item={d} downloadingId={downloadingId} onDownload={handleDownload} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {downloads.length === 0 && (
        <div className="card p-12 text-center">
          <Download size={64} className="mx-auto text-gray-300 mb-5" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes descargas aún</h2>
          <p className="text-gray-500 mb-6">Los recursos que compres o descargues gratis aparecerán aquí.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar recursos</Link>
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, downloadingId, onDownload }: {
  item: DownloadItem
  downloadingId: string | null
  onDownload: (item: DownloadItem) => void
}) {
  const isDownloading = downloadingId === item.id
  const isPurchased = item.type === 'purchased'

  return (
    <div className="card p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isPurchased ? 'bg-primary-100' : 'bg-emerald-100'}`}>
          {isPurchased
            ? <FileText size={24} className="text-primary-600" />
            : <BookOpen size={24} className="text-emerald-600" />
          }
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate">{item.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
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
        <button
          onClick={() => onDownload(item)}
          disabled={isDownloading}
          className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isDownloading ? 'Descargando...' : 'Descargar'}
        </button>
      </div>
    </div>
  )
}
