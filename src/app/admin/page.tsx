'use client'

import { useState, useEffect } from 'react'
import { FileText, Users, ShoppingCart, Download, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Resource } from '@/lib/data'

export default function AdminDashboard() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

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

  const stats = [
    { label: 'Recursos totales', value: resources.length, icon: FileText, color: 'text-blue-600 bg-blue-100' },
    { label: 'Usuarios registrados', value: 156, icon: Users, color: 'text-green-600 bg-green-100' },
    { label: 'Órdenes completadas', value: 89, icon: ShoppingCart, color: 'text-purple-600 bg-purple-100' },
    { label: 'Descargas totales', value: resources.reduce((s, r) => s + (r.downloadsCount || 0), 0), icon: Download, color: 'text-orange-600 bg-orange-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recursos</h2>
          <Link href="/admin/nuevo-recurso" className="btn-primary text-sm">Nueva entrada</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-gray-500 font-medium">Título</th>
                <th className="text-left py-3 text-gray-500 font-medium">Curso</th>
                <th className="text-left py-3 text-gray-500 font-medium">Tipo</th>
                <th className="text-left py-3 text-gray-500 font-medium">Precio</th>
                <th className="text-left py-3 text-gray-500 font-medium">Descargas</th>
                <th className="text-right py-3 text-gray-500 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-6 text-center text-gray-400">Cargando...</td></tr>
              ) : resources.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-gray-400">No hay recursos aún</td></tr>
              ) : resources.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{r.title}</td>
                  <td className="py-3 text-gray-500">{r.courseName}</td>
                  <td className="py-3">
                    <span className={`badge ${r.resourceType === 'educational' ? 'badge-blue' : 'badge-purple'}`}>
                      {r.resourceType === 'educational' ? 'Material' : 'Evaluación'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{r.isFree ? 'Gratis' : `$${r.priceClp}`}</td>
                  <td className="py-3 text-gray-500">{r.downloadsCount}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/recurso/${r.id}`} className="text-gray-400 hover:text-primary-600" title="Ver">
                        <Eye size={14} />
                      </Link>
                      <Link href={`/admin/editar-recurso/${r.id}`} className="text-gray-400 hover:text-amber-600" title="Editar">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(r.id, r.title)} className="text-gray-400 hover:text-red-600" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
