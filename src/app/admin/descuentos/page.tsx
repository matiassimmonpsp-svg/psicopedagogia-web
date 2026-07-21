'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { logger } from '@/lib/logger'
import { DiscountTable, type DiscountCode } from '@/components/admin/DiscountTable'
import { DiscountForm } from '@/components/admin/DiscountForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { csrfFetch } from '@/lib/csrf-client'
import { useConfirmDialog } from '@/lib/hooks-confirm'

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
  const { open: confirmOpen, title: confirmTitle, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  async function fetchCodes() {
    try {
      const res = await fetch('/api/discount-codes')
      const data = await res.json()
      setCodes(data.codes || [])
    } catch (err) {
      logger.error('Error fetching codes', { error: err })
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

      const res = await csrfFetch(url, {
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  async function handleDelete(id: number, c: string) {
    showConfirm(
      'Eliminar código',
      `¿Eliminar código "${c}"?`,
      async () => {
        try {
          await csrfFetch(`/api/discount-codes/${id}`, { method: 'DELETE' })
          setCodes(prev => prev.filter(c => c.id !== id))
        } catch {
          toast.error('Error al eliminar')
        }
      }
    )
  }

  async function toggleActive(id: number, current: boolean) {
    setToggling(id)
    try {
      const res = await csrfFetch(`/api/discount-codes/${id}`, {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Códigos de Descuento</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> {showForm ? 'Cancelar' : 'Nuevo código'}
        </button>
      </div>

      {showForm && (
        <DiscountForm
          code={code}
          discountPct={discountPct}
          maxUses={maxUses}
          expiresAt={expiresAt}
          editingId={editingId}
          onCodeChange={setCode}
          onDiscountPctChange={setDiscountPct}
          onMaxUsesChange={setMaxUses}
          onExpiresAtChange={setExpiresAt}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <DiscountTable
        codes={codes}
        loading={loading}
        copiedId={copiedId}
        toggling={toggling}
        onCopy={copyToClipboard}
        onToggle={toggleActive}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <p className="text-xs text-gray-400 mt-3">{codes.length} código{codes.length !== 1 ? 's' : ''} en total</p>

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
