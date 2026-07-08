'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Copy, Check, Tag, Edit3, Power, PowerOff } from 'lucide-react'

interface DiscountCode {
  id: number
  code: string
  discountPct: number
  isActive: boolean
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  createdAt: string
}

export default function AdminDiscountCodes() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

  const [code, setCode] = useState('')
  const [discountPct, setDiscountPct] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const [copiedId, setCopiedId] = useState<number | null>(null)

  async function fetchCodes() {
    try {
      const res = await fetch('/api/discount-codes')
      const data = await res.json()
      setCodes(data.codes || [])
    } catch {
      console.error('Error fetching codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCodes() }, [])

  function resetForm() {
    setCode('')
    setDiscountPct('')
    setMaxUses('')
    setExpiresAt('')
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(c: DiscountCode) {
    setEditingId(c.id)
    setCode(c.code)
    setDiscountPct(String(c.discountPct))
    setMaxUses(c.maxUses ? String(c.maxUses) : '')
    setExpiresAt(c.expiresAt ? c.expiresAt.split('T')[0] : '')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !discountPct) return

    try {
      const url = editingId ? `/api/discount-codes/${editingId}` : '/api/discount-codes'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          discountPct: Number(discountPct),
          maxUses: maxUses || null,
          expiresAt: expiresAt || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }
      resetForm()
      fetchCodes()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleDelete(id: number, c: string) {
    if (!confirm(`¿Eliminar código "${c}"?`)) return
    try {
      await fetch(`/api/discount-codes/${id}`, { method: 'DELETE' })
      setCodes(prev => prev.filter(c => c.id !== id))
    } catch {
      toast.error('Error al eliminar')
    }
  }

  async function toggleActive(id: number, current: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/discount-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      if (res.ok) {
        setCodes(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c))
      }
    } catch {
      toast.error('Error al cambiar estado')
    } finally {
      setToggling(null)
    }
  }

  function copyToClipboard(id: number, code: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function isExpired(c: DiscountCode) {
    return c.expiresAt && new Date(c.expiresAt) < new Date()
  }

  function isExhausted(c: DiscountCode) {
    return c.maxUses !== null && c.usedCount >= c.maxUses
  }

  function isUnavailable(c: DiscountCode) {
    return !c.isActive || isExpired(c) || isExhausted(c)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Códigos de Descuento</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> {showForm ? 'Cancelar' : 'Nuevo código'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-lg">
          <h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Editar código de descuento' : 'Crear código de descuento'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="input-field" placeholder="EJ: PSICO10" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
              <input type="number" value={discountPct} onChange={e => setDiscountPct(e.target.value)} className="input-field" placeholder="10" min="1" max="100" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos (opcional)</label>
                <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} className="input-field" placeholder="Ilimitado" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha expiración (opcional)</label>
                <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editingId ? 'Guardar cambios' : 'Crear código'}</button>
              {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>}
            </div>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando códigos...</div>
        ) : codes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay códigos de descuento aún.</div>
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
                  const unavailable = isUnavailable(c)
                  const usoPct = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : 0
                  return (
                  <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${unavailable ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-primary-500" />
                        <span className="font-mono font-bold text-gray-900">{c.code}</span>
                        <button
                          onClick={() => copyToClipboard(c.id, c.code)}
                          className="p-1 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50 transition-colors"
                          title="Copiar"
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
                          onClick={() => toggleActive(c.id, c.isActive)}
                          disabled={toggling === c.id || expired || exhausted}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-primary-50 transition-colors disabled:opacity-30"
                          title={c.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {c.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                        </button>
                        <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors" title="Editar">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.code)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Eliminar">
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

      <p className="text-xs text-gray-400 mt-3">{codes.length} código{codes.length !== 1 ? 's' : ''} en total</p>
    </div>
  )
}
