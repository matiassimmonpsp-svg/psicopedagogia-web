'use client'

import { useEffect, useState } from 'react'
import { FileText, Users, ShoppingCart, Download } from 'lucide-react'
import Link from 'next/link'
import ResourceTable from '@/components/ResourceTable'
import { useCatalog, useResourceActions } from '@/lib/hooks'

interface AdminStats {
  users: number
  orders: number
}

export default function AdminDashboard() {
  const { resources, loading, refresh } = useCatalog()
  const { handleDelete } = useResourceActions(refresh)
  const [stats, setStats] = useState<AdminStats>({ users: 0, orders: 0 })

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch((err) => console.error('Error al cargar estadísticas:', err))
  }, [])

  const cards = [
    { label: 'Recursos totales', value: resources.length, icon: FileText, color: 'text-blue-600 bg-blue-100' },
    { label: 'Usuarios registrados', value: stats.users, icon: Users, color: 'text-green-600 bg-green-100' },
    { label: 'Órdenes completadas', value: stats.orders, icon: ShoppingCart, color: 'text-purple-600 bg-purple-100' },
    { label: 'Descargas totales', value: resources.reduce((s: number, r: { downloadsCount?: number }) => s + (r.downloadsCount || 0), 0), icon: Download, color: 'text-orange-600 bg-orange-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(s => (
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
