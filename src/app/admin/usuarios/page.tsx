'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Shield, ShieldOff, Trash2, Edit3, AlertCircle, X } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { orders: number; downloads: number }
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('No autorizado')
      const data = await res.json()
      setUsers(data.users)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  function openEdit(user: User) {
    setEditingUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditPassword('')
  }

  function closeEdit() {
    setEditingUser(null)
    setEditPassword('')
  }

  async function saveEdit() {
    if (!editingUser) return
    if (!editName.trim() || !editEmail.trim()) {
      toast.error('Nombre y correo son obligatorios')
      return
    }

    setSaving(true)
    const body: any = { name: editName.trim(), email: editEmail.trim() }
    if (editPassword) body.password = editPassword

    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: data.user.name, email: data.user.email } : u))
      closeEdit()
    } else {
      const data = await res.json()
      toast.error(data.error)
    }
    setSaving(false)
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`¿Cambiar rol a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}?`)) return

    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })

    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } else {
      const data = await res.json()
      toast.error(data.error)
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`¿Eliminar a "${userName}"? Se perderán sus pedidos y descargas.`)) return

    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Gestión de Usuarios</h1>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-6">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Nombre</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Rol</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Órdenes</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Descargas</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Registro</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-6 text-center text-gray-400">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-gray-400">No hay usuarios registrados</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                  <td className="py-3 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">{u._count.orders}</td>
                  <td className="py-3 px-4 text-center text-gray-500">{u._count.downloads}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Editar datos"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => toggleRole(u.id, u.role)}
                        className="text-gray-400 hover:text-amber-600"
                        title={u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      >
                        {u.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="text-gray-400 hover:text-red-600"
                        title="Eliminar"
                      >
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

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeEdit}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Editar Usuario</h2>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                  <span className="text-gray-400 font-normal ml-1">(dejar vacío para no cambiar)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Escribe una nueva contraseña"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeEdit} className="btn-secondary px-4 py-2">Cancelar</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary px-4 py-2">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
