'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Sparkles, Gift, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { courses, areas } from '@/lib/data'
import { downloadFile } from '@/lib/utils'
import type { DownloadItem } from '@/lib/data'
import { logger } from '@/lib/logger'
import {
  DownloadsFilters,
  DownloadItemRow,
  DownloadsEmpty,
  DownloadsSection,
  DownloadsSkeleton,
} from '@/components/DownloadsComponents'

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
      } catch (err) { logger.error('Error al cargar descargas', { error: err }) } finally {
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

  const hasFilters = !!(typeFilter || courseFilter || areaFilter || resourceTypeFilter || search)
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
    return <DownloadsSkeleton />
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Descargas</h1>
      <p className="text-gray-500 mb-8 text-lg">Recursos que has adquirido o descargado gratis</p>

      {downloads.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <DownloadsFilters
            search={search}
            setSearch={setSearch}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            areaFilter={areaFilter}
            setAreaFilter={setAreaFilter}
            resourceTypeFilter={resourceTypeFilter}
            setResourceTypeFilter={setResourceTypeFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            hasFilters={hasFilters}
            activeFilterCount={activeFilterCount}
            clearFilters={clearFilters}
          />

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
              <DownloadsEmpty
                hasFilters={hasFilters}
                activeFilterCount={activeFilterCount}
                clearFilters={clearFilters}
                onExplore={() => router.push('/')}
              />
            ) : (
              <div className="space-y-8">
                <DownloadsSection
                  title="Comprados"
                  count={purchased.length}
                  icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>}
                  iconColor="#3b82f6"
                  items={purchased}
                  downloadingId={downloadingId}
                  onDownload={handleDownload}
                />
                <DownloadsSection
                  title="Gratis"
                  count={freebies.length}
                  icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /><path d="M18 4v16" /></svg>}
                  iconColor="#10b981"
                  items={freebies}
                  downloadingId={downloadingId}
                  onDownload={handleDownload}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {downloads.length === 0 && (
        <DownloadsEmpty
          hasFilters={false}
          activeFilterCount={0}
          clearFilters={clearFilters}
          onExplore={() => router.push('/')}
        />
      )}
    </div>
  )
}
