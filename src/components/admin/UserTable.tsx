'use client'

import { Shield, ShieldOff, Trash2, Edit3 } from 'lucide-react'

export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { orders: number; downloads: number }
}

interface UserTableProps {
  users: User[]
  loading: boolean
  onEdit: (user: User) => void
  onToggleRole: (userId: string, currentRole: string) => void
  onDelete: (userId: string, userName: string) => void
}

export function UserTable({ users, loading, onEdit, onToggleRole, onDelete }: UserTableProps) {
  return (
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
              <tr><td colSpan={7} className="py-6 text-center text-gray-500">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="py-6 text-center text-gray-500">No hay usuarios registrados</td></tr>
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
                      onClick={() => onEdit(u)}
                      className="text-gray-400 hover:text-blue-600"
                      aria-label={`Editar datos de ${u.name}`}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onToggleRole(u.id, u.role)}
                      className="text-gray-400 hover:text-amber-600"
                      aria-label={u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                    >
                      {u.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                    <button
                      onClick={() => onDelete(u.id, u.name)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Eliminar usuario ${u.name}`}
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
  )
}
