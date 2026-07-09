'use client'

import toast from 'react-hot-toast'
import { FileText, Users, ShoppingCart, Download } from 'lucide-react'
import Link from 'next/link'
import ResourceTable from '@/components/ResourceTable'
import { useCatalog } from '@/lib/hooks'

export default function AdminDashboard() {
  const { resources, loading, refresh } = useCatalog()

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const stats = [
    { label: 'Recursos totales', value: resources.length, icon: FileText, color: 'text-blue-600 bg-blue-100' },
    { label: 'Usuarios registrados', value: 156, icon: Users, color: 'text-green-600 bg-green-100' },
    { label: 'Órdenes completadas', value: 89, icon: ShoppingCart, color: 'text-purple-600 bg-purple-100' },
    { label: 'Descargas totales', value: resources.reduce((s: number, r: any) => s + (r.downloadsCount || 0), 0), icon: Download, color: 'text-orange-600 bg-orange-100' },
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
          <ResourceTable resources={resources} loading={loading} onDelete={handleDelete} />
        </div>
    </div>
  )
}
