'use client'

import { Tag, Copy, Check, Power, PowerOff, Trash2, Edit3 } from 'lucide-react'

export interface DiscountCode {
  id: number
  code: string
  discountPct: number
  isActive: boolean
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  createdAt: string
}

interface DiscountTableProps {
  codes: DiscountCode[]
  loading: boolean
  copiedId: number | null
  toggling: number | null
  onCopy: (id: number, code: string) => void
  onToggle: (id: number, current: boolean) => void
  onEdit: (code: DiscountCode) => void
  onDelete: (id: number, code: string) => void
}

function isExpired(c: DiscountCode) {
  return c.expiresAt && new Date(c.expiresAt) < new Date()
}

function isExhausted(c: DiscountCode) {
  return c.maxUses !== null && c.usedCount >= c.maxUses
}

export function DiscountTable({ codes, loading, copiedId, toggling, onCopy, onToggle, onEdit, onDelete }: DiscountTableProps) {
  return (
    <div className="card overflow-hidden">
      {loading ? (
        <div className="p-8 text-center text-gray-500">Cargando códigos...</div>
      ) : codes.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No hay códigos de descuento aún.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Código</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dto.</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Usos</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Expira</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Estado</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(c => {
                const expired = isExpired(c)
                const exhausted = isExhausted(c)
                const unavailable = !c.isActive || expired || exhausted
                const usoPct = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : 0
                return (
                <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${unavailable ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-primary-500" />
                      <span className="font-mono font-bold text-gray-900">{c.code}</span>
                      <button
                        onClick={() => onCopy(c.id, c.code)}
                        className="p-1 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50 transition-colors"
                        aria-label={`Copiar código ${c.code}`}
                      >
                        {copiedId === c.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{c.discountPct}%</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs whitespace-nowrap">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</span>
                      {c.maxUses && (
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${usoPct >= 100 ? 'bg-red-400' : usoPct >= 80 ? 'bg-amber-400' : 'bg-primary-400'}`} style={{ width: `${usoPct}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {c.expiresAt ? (
                      <span className={expired ? 'text-red-500' : ''}>
                        {new Date(c.expiresAt).toLocaleDateString('es-CL')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {expired ? (
                      <span className="badge badge-red">Expirado</span>
                    ) : exhausted ? (
                      <span className="badge badge-red">Agotado</span>
                    ) : (
                      <span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>
                        {c.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggle(c.id, c.isActive)}
                        disabled={toggling === c.id || expired || exhausted}
                        className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50 transition-colors disabled:opacity-30"
                        aria-label={c.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {c.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                      </button>
                      <button onClick={() => onEdit(c)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors" aria-label="Editar código">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => onDelete(c.id, c.code)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" aria-label={`Eliminar código ${c.code}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
