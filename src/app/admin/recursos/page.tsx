'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Eye, Edit, Trash2, PlusCircle, Pause, Play, X, Filter } from 'lucide-react'
import Link from 'next/link'
import type { Resource } from '@/lib/data'
import { courses } from '@/lib/data'

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  async function fetchResources() {
    try {
      const res = await fetch('/api/catalog')
      const data = await res.json()
      setResources(data.resources || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResources() }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setResources(prev => prev.filter(r => r.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleToggleActive(id: string, current: boolean | undefined) {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !(current ?? true) }),
      })
      if (!res.ok) throw new Error('Error')
      setResources(prev => prev.map(r => r.id === id ? { ...r, isActive: !(r.isActive ?? true) } : r))
    } catch {
      alert('Error al cambiar estado')
    }
  }

  const filtered = useMemo(() => {
    let result = resources
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    }
    if (courseFilter) {
      result = result.filter(r => r.courseId === Number(courseFilter))
    }
    if (typeFilter) {
      result = result.filter(r => r.resourceType === typeFilter)
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
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="input-field pl-9 w-full"
            />
          </div>
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field min-w-[140px]">
            <option value="">Todos los cursos</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field min-w-[140px]">
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
          <div className="p-8 text-center text-gray-400">
            {hasFilters ? 'No hay recursos que coincidan con los filtros.' : 'No hay recursos aún.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Título</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Curso</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Precio</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Descargas</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Estado</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${r.isActive === false ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[250px] truncate">{r.title}</td>
                    <td className="py-3 px-4 text-gray-500">{r.courseName}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${r.resourceType === 'educational' ? 'badge-blue' : 'badge-purple'}`}>
                        {r.resourceType === 'educational' ? 'Material' : 'Evaluación'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{r.isFree ? 'Gratis' : `$${r.priceClp}`}</td>
                    <td className="py-3 px-4 text-gray-500">{r.downloadsCount}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(r.id, r.isActive)}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                          r.isActive === false
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {r.isActive === false ? <Pause size={12} /> : <Play size={12} />}
                        {r.isActive === false ? 'En pausa' : 'Activo'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/recurso/${r.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50 transition-colors" title="Ver">
                          <Eye size={14} />
                        </Link>
                        <Link href={`/admin/editar-recurso/${r.id}`} className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors" title="Editar">
                          <Edit size={14} />
                        </Link>
                        <button onClick={() => handleDelete(r.id, r.title)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {hasFilters
          ? `Mostrando ${filtered.length} de ${resources.length} recursos`
          : `${resources.length} recursos en total`
        }
      </p>
    </div>
  )
}
