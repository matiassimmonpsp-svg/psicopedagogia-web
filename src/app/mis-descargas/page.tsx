'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FileText, Clock, Loader2, Sparkles, Gift, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface DownloadItem {
  id: string
  resourceId: string
  title: string
  courseName: string | null
  date: string
  type: 'purchased' | 'free'
}

export default function DownloadsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

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
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, authLoading, router])

  async function handleDownload(item: DownloadItem) {
    setDownloadingId(item.id)
    try {
      const res = await fetch(`/api/download/${item.resourceId}`)
      if (res.status === 401) { router.push('/login'); return }
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Error al descargar'); return }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${item.title.replace(/[^a-z0-9]+/gi, '-')}.pdf`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch { alert('Error de conexión') }
    finally { setDownloadingId(null) }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
  }

  const purchased = downloads.filter(d => d.type === 'purchased')
  const free = downloads.filter(d => d.type === 'free')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Descargas</h1>
      <p className="text-gray-500 mb-8">Recursos que has adquirido o descargado gratis</p>

      {downloads.length === 0 ? (
        <div className="card p-8 text-center">
          <Download size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No tienes descargas aún</h2>
          <p className="text-gray-500 text-sm mb-6">Los recursos que compres o descargues gratis aparecerán aquí.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar recursos</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {purchased.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <Sparkles size={18} className="text-primary-500" /> Comprados
              </h2>
              <div className="space-y-2">
                {purchased.map(d => (
                  <ItemRow key={d.id} item={d} downloadingId={downloadingId} onDownload={handleDownload} />
                ))}
              </div>
            </section>
          )}

          {free.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <Gift size={18} className="text-emerald-500" /> Gratis
              </h2>
              <div className="space-y-2">
                {free.map(d => (
                  <ItemRow key={d.id} item={d} downloadingId={downloadingId} onDownload={handleDownload} />
                ))}
              </div>
            </section>
          )}
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
    <div className="card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isPurchased ? 'bg-primary-100' : 'bg-emerald-100'}`}>
          <FileText size={20} className={isPurchased ? 'text-primary-600' : 'text-emerald-600'} />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} /> {new Date(item.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Link href={`/recurso/${item.resourceId}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver
        </Link>
        <button
          onClick={() => onDownload(item)}
          disabled={isDownloading}
          className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <ArrowDown size={14} />}
          {isDownloading ? '...' : 'Descargar'}
        </button>
      </div>
    </div>
  )
}
