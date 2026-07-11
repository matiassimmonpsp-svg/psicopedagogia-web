'use client'

import { Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Resource } from '@/lib/data'

/**
 * Props del componente ResourceTable.
 * @property resources - Lista de recursos a mostrar en la tabla.
 * @property loading - Si es true, muestra un estado de carga.
 * @property onDelete - Callback que se ejecuta al eliminar un recurso (recibe id y título).
 * @property showStatus - Si es true, muestra la columna de estado (activo/en pausa).
 * @property onToggleActive - Callback para alternar el estado activo/inactivo de un recurso.
 */
interface ResourceTableProps {
  resources: Resource[]
  loading?: boolean
  onDelete: (id: string, title: string) => void
  showStatus?: boolean
  onToggleActive?: (id: string, current: boolean | undefined) => void
}

/**
 * Tabla de recursos para el panel de administración.
 *
 * Renderiza una tabla con columns de título, curso, tipo, precio, descargas
 * y acciones (ver, editar, eliminar). Opcionalmente muestra el estado activo/pausa
 * con botón para alternar. Muestra estados de carga y lista vacía.
 *
 * @param resources - Array de recursos a mostrar.
 * @param loading - Estado de carga.
 * @param onDelete - Función para eliminar un recurso.
 * @param showStatus - Mostrar columna de estado.
 * @param onToggleActive - Función para cambiar el estado activo.
 */
export default function ResourceTable({ resources, loading, onDelete, showStatus, onToggleActive }: ResourceTableProps) {
  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>

  if (resources.length === 0) {
    return <div className="p-8 text-center text-gray-400">No hay recursos aún</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Título</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Curso</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Tipo</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Precio</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Descargas</th>
            {showStatus && <th className="text-left py-3 px-4 text-gray-500 font-medium">Estado</th>}
            <th className="text-right py-3 px-4 text-gray-500 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${r.isActive === false && showStatus ? 'opacity-50' : ''}`}>
              <td className="py-3 px-4 font-medium text-gray-900 max-w-[250px] truncate">{r.title}</td>
              <td className="py-3 px-4 text-gray-500">{r.courseName}</td>
              <td className="py-3 px-4">
                <span className={`badge ${r.resourceType === 'educational' ? 'badge-blue' : 'badge-purple'}`}>
                  {r.resourceType === 'educational' ? 'Material' : 'Evaluación'}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500">{r.isFree ? 'Gratis' : `$${r.priceClp}`}</td>
              <td className="py-3 px-4 text-gray-500">{r.downloadsCount}</td>
              {showStatus && (
                <td className="py-3 px-4">
                  {onToggleActive && (
                    <button
                      onClick={() => onToggleActive(r.id, r.isActive)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                        r.isActive === false
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {r.isActive === false ? 'En pausa' : 'Activo'}
                    </button>
                  )}
                </td>
              )}
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/recurso/${r.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50 transition-colors" title="Ver">
                    <Eye size={14} />
                  </Link>
                  <Link href={`/admin/editar-recurso/${r.id}`} className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors" title="Editar">
                    <Edit size={14} />
                  </Link>
                  <button onClick={() => onDelete(r.id, r.title)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
