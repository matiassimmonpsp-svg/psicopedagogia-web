'use client'

import { useState, useEffect } from 'react'
import { User, Mail, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const [downloadCount, setDownloadCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetch('/api/downloads')
      .then(r => r.json())
      .then(d => setDownloadCount(d.downloads?.length || 0))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch('/api/orders/count')
      .then(r => r.json())
      .then(d => setOrderCount(d.count || 0))
      .catch(() => {})
  }, [user])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <User size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h1>
        <p className="text-gray-500 mb-6">Necesitas iniciar sesión para ver tu perfil.</p>
        <Link href="/login" className="btn-primary">Iniciar sesión</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">{user.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{user.name}</h2>
            <p className="text-sm text-gray-500">
              {user.role === 'admin' ? 'Administrador' : 'Usuario'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-gray-400" />
            <span className="text-gray-700">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{downloadCount}</p>
          <p className="text-sm text-gray-500">Descargas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{orderCount}</p>
          <p className="text-sm text-gray-500">Compras</p>
        </div>
      </div>

      <button onClick={logout} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 w-full">
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  )
}
