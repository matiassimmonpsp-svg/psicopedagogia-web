'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'
import { UserTable, type User } from '@/components/admin/UserTable'
import { UserEditModal } from '@/components/admin/UserEditModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { csrfFetch } from '@/lib/csrf-client'
import { useConfirmDialog } from '@/lib/hooks-confirm'

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const { open: confirmOpen, title: confirmTitle, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('No autorizado')
      const data = await res.json()
      setUsers(data.users)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
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
    const body: Record<string, unknown> = { name: editName.trim(), email: editEmail.trim() }
    if (editPassword) body.password = editPassword

    try {
      const res = await csrfFetch(`/api/users/${editingUser.id}`, {
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
    } catch {
      toast.error('Error de conexión')
    }
    setSaving(false)
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    showConfirm(
      'Cambiar rol',
      `¿Cambiar rol a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}?`,
      async () => {
        try {
          const res = await csrfFetch(`/api/users/${userId}`, {
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
        } catch {
          toast.error('Error de conexión')
        }
      }
    )
  }

  async function handleDelete(userId: string, userName: string) {
    showConfirm(
      'Eliminar usuario',
      `¿Eliminar a "${userName}"? Se perderán sus pedidos y descargas.`,
      async () => {
        try {
          const res = await csrfFetch(`/api/users/${userId}`, { method: 'DELETE' })
          if (res.ok) {
            setUsers(prev => prev.filter(u => u.id !== userId))
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Gestión de Usuarios</h1>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-6">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <UserTable
        users={users}
        loading={loading}
        onEdit={openEdit}
        onToggleRole={toggleRole}
        onDelete={handleDelete}
      />

      {editingUser && (
        <UserEditModal
          user={editingUser}
          name={editName}
          email={editEmail}
          password={editPassword}
          saving={saving}
          onNameChange={setEditName}
          onEmailChange={setEditEmail}
          onPasswordChange={setEditPassword}
          onSave={saveEdit}
          onClose={closeEdit}
        />
      )}

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
