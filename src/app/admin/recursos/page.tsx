'use client'

import { useState, useMemo } from 'react'
import { Search, PlusCircle, X } from 'lucide-react'
import Link from 'next/link'
import { courses } from '@/lib/data'
import ResourceTable from '@/components/ResourceTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useCatalog, useResourceActions } from '@/lib/hooks'
import type { Resource } from '@/lib/data'

export default function AdminResources() {
  const { resources, loading, refresh } = useCatalog()
  const { handleDelete, handleToggleActive } = useResourceActions(refresh)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null)

  function requestDelete(id: string, title: string) {
    setPendingDelete({ id, title })
    setConfirmOpen(true)
  }

  function confirmDelete() {
    if (pendingDelete) {
      handleDelete(pendingDelete.id, pendingDelete.title)
      setPendingDelete(null)
      setConfirmOpen(false)
    }
  }

  const filtered = useMemo(() => {
    let result = resources
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r: Resource) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    }
    if (courseFilter) {
      result = result.filter((r: Resource) => r.courseSlug === courseFilter)
    }
    if (typeFilter) {
      result = result.filter((r: Resource) => r.resourceType === typeFilter)
    }
    return result
  }, [resources, search, courseFilter, typeFilter])

  const clearFilters = () => {
    setSearch('')
    setCourseFilter('')
    setTypeFilter('')
  }

  const hasFilters = search || courseFilter || typeFilter

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recursos</h1>
        <Link href="/admin/nuevo-recurso" className="btn-primary inline-flex items-center gap-2 text-sm">
          <PlusCircle size={16} /> Nueva entrada
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <label htmlFor="admin-resource-search" className="sr-only">Buscar recurso</label>
            <input
              id="admin-resource-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="input-field pl-9 w-full"
            />
          </div>
          <label htmlFor="admin-course-filter" className="sr-only">Filtrar por curso</label>
          <select id="admin-course-filter" value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field min-w-[140px]">
            <option value="">Todos los cursos</option>
            {courses.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <label htmlFor="admin-type-filter" className="sr-only">Filtrar por tipo</label>
          <select id="admin-type-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field min-w-[140px]">
            <option value="">Todos los tipos</option>
            <option value="evaluation">Evaluación</option>
            <option value="educational">Material educativo</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary inline-flex items-center gap-1 text-sm whitespace-nowrap">
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando recursos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {hasFilters ? 'No hay recursos que coincidan con los filtros.' : 'No hay recursos aún.'}
          </div>
        ) : (
          <ResourceTable resources={filtered} onDelete={requestDelete} showStatus onToggleActive={handleToggleActive} />
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {hasFilters
          ? `Mostrando ${filtered.length} de ${resources.length} recursos`
          : `${resources.length} recursos en total`
        }
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar recurso"
        message={pendingDelete ? `¿Eliminar "${pendingDelete.title}"? Esta acción no se puede deshacer.` : ''}
        danger
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
      />
    </div>
  )
}
