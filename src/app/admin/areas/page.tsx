'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { csrfFetch } from '@/lib/csrf-client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useConfirmDialog } from '@/lib/hooks-confirm'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react'
import type { AreaWithSubareas, SubareaWithCount } from '@/lib/interfaces'

export default function AdminAreas() {
  const [areas, setAreas] = useState<AreaWithSubareas[]>([])
  const [loading, setLoading] = useState(true)
  const [newAreaName, setNewAreaName] = useState('')
  const [expandedArea, setExpandedArea] = useState<number | null>(null)
  const [newSubareaName, setNewSubareaName] = useState('')

  const { open: confirmOpen, title: confirmTitle, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  async function fetchAreas() {
    try {
      const res = await fetch('/api/areas')
      if (!res.ok) throw new Error('No autorizado')
      const data = await res.json()
      setAreas(data.areas)
    } catch {
      toast.error('Error al cargar áreas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAreas() }, [])

  async function createArea() {
    if (!newAreaName.trim()) return toast.error('Escribe un nombre')
    try {
      const res = await csrfFetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAreaName.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setAreas(prev => [...prev, { ...data.area, subareas: [], _count: { resources: 0 } }])
        setNewAreaName('')
        toast.success('Área creada')
      } else {
        const data = await res.json()
        toast.error(data.error)
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  async function toggleAreaActive(area: AreaWithSubareas) {
    try {
      const res = await csrfFetch(`/api/areas/${area.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !area.isActive }),
      })
      if (res.ok) {
        setAreas(prev => prev.map(a => a.id === area.id ? { ...a, isActive: !a.isActive } : a))
      } else {
        toast.error('Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  async function deleteArea(area: AreaWithSubareas) {
    showConfirm(
      'Eliminar área',
      `¿Eliminar "${area.name}"?${area._count.resources > 0 ? ` Tiene ${area._count.resources} recursos.` : ''}`,
      async () => {
        try {
          const res = await csrfFetch(`/api/areas/${area.id}`, { method: 'DELETE' })
          if (res.ok) {
            setAreas(prev => prev.filter(a => a.id === area.id))
            toast.success('Área eliminada')
          } else {
            const data = await res.json()
            toast.error(data.error)
          }
        } catch {
          toast.error('Error de conexión')
        }
      }
    )
  }

  async function createSubarea(areaId: number) {
    if (!newSubareaName.trim()) return toast.error('Escribe un nombre')
    try {
      const res = await csrfFetch('/api/subareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubareaName.trim(), areaId }),
      })
      if (res.ok) {
        const data = await res.json()
        setAreas(prev => prev.map(a => a.id === areaId
          ? { ...a, subareas: [...a.subareas, { ...data.subarea, _count: { resources: 0 } }] }
          : a))
        setNewSubareaName('')
        toast.success('Subárea creada')
      } else {
        const data = await res.json()
        toast.error(data.error)
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  async function toggleSubareaActive(areaId: number, subarea: SubareaWithCount) {
    try {
      const res = await csrfFetch(`/api/subareas/${subarea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !subarea.isActive }),
      })
      if (res.ok) {
        setAreas(prev => prev.map(a => a.id === areaId
          ? { ...a, subareas: a.subareas.map(s => s.id === subarea.id ? { ...s, isActive: !s.isActive } : s) }
          : a))
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  async function deleteSubarea(areaId: number, subarea: SubareaWithCount) {
    showConfirm(
      'Eliminar subárea',
      `¿Eliminar subárea "${subarea.name}"?`,
      async () => {
        try {
          const res = await csrfFetch(`/api/subareas/${subarea.id}`, { method: 'DELETE' })
          if (res.ok) {
            setAreas(prev => prev.map(a => a.id === areaId
              ? { ...a, subareas: a.subareas.filter(s => s.id !== subarea.id) }
              : a))
            toast.success('Subárea eliminada')
          } else {
            const data = await res.json()
            toast.error(data.error)
          }
        } catch {
          toast.error('Error de conexión')
        }
      }
    )
  }

  if (loading) return <p className="text-gray-500" role="status">Cargando áreas...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Gestión de Áreas y Subáreas</h1>

      {/* Crear área nueva */}
      <div className="card p-4 mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">Nueva Área</h2>
        <div className="flex gap-3">
          <label htmlFor="new-area-name" className="sr-only">Nombre del área</label>
          <input
            id="new-area-name"
            type="text"
            value={newAreaName}
            onChange={e => setNewAreaName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createArea()}
            placeholder="Ej: Estimulación Cognitiva"
            className="input-field flex-1"
          />
          <button onClick={createArea} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Crear
          </button>
        </div>
      </div>

      {/* Lista de áreas */}
      <div className="space-y-4">
        {areas.map(area => (
          <div key={area.id} className="card overflow-hidden">
            {/* Fila del área */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
                aria-expanded={expandedArea === area.id}
                aria-label={expandedArea === area.id ? `Colapsar ${area.name}` : `Expandir ${area.name}`}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedArea === area.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              <GripVertical size={16} className="text-gray-300" />
              <span className="font-medium text-gray-900 flex-1">{area.name}</span>
              <span className="text-xs text-gray-500">{area._count.resources} recursos</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${area.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                {area.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <button
                type="button"
                onClick={() => toggleAreaActive(area)}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                {area.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                type="button"
                onClick={() => deleteArea(area)}
                aria-label={`Eliminar área ${area.name}`}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Subáreas (expandible) */}
            {expandedArea === area.id && (
              <div className="border-t border-gray-100 px-4 py-3">
                {area.subareas.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-3">Sin subáreas</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {area.subareas.map(sub => (
                      <div key={sub.id} className="flex items-center gap-3 pl-8">
                        <span className={`flex-1 text-sm ${sub.isActive ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                          {sub.name}
                        </span>
                        <span className="text-xs text-gray-400">{sub._count.resources}</span>
                        <button
                          type="button"
                          onClick={() => toggleSubareaActive(area.id, sub as SubareaWithCount)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          {sub.isActive ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubarea(area.id, sub as SubareaWithCount)}
                          aria-label={`Eliminar subárea ${sub.name}`}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar subárea */}
                <div className="flex gap-2 pl-8">
                  <label htmlFor={`new-subarea-${area.id}`} className="sr-only">Nombre de la subárea</label>
                  <input
                    id={`new-subarea-${area.id}`}
                    type="text"
                    value={expandedArea === area.id ? newSubareaName : ''}
                    onChange={e => setNewSubareaName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createSubarea(area.id)}
                    placeholder="Nueva subárea..."
                    className="input-field flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => createSubarea(area.id)}
                    aria-label="Agregar subárea"
                    className="text-sm px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        danger
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  )
}
