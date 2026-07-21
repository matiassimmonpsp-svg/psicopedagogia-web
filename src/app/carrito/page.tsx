'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Trash2, ShoppingBag, ArrowLeft, Percent, X } from 'lucide-react'
import { formatClp } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { saveDiscountToSession, loadDiscountFromSession, clearDiscountFromSession } from '@/lib/discount-storage'
import { csrfFetch } from '@/lib/csrf-client'

/** Página del carrito de compras */
export default function CartPage() {
  const { items, removeItem, subtotal, loading } = useCart()
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState<number | null>(null)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [discountError, setDiscountError] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const saved = loadDiscountFromSession()
    if (saved) {
      setDiscountCode(saved.code)
      setDiscount(saved.amount)
      setDiscountPercent(saved.percent)
    }
  }, [])

  function handleRemove(id: string) {
    removeItem(id)
    if (discount !== null) removeDiscount()
  }

  async function verifyCode() {
    if (!discountCode.trim()) return
    setVerifying(true)
    setDiscountError('')
    try {
      const total = items.reduce((sum, i) => sum + (i.priceClp ?? 0), 0)
      const res = await csrfFetch('/api/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', code: discountCode, cartTotal: total }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDiscountError(data.error || 'Código no válido')
        setDiscount(null)
        setDiscountPercent(0)
        clearDiscountFromSession()
      } else {
        setDiscount(data.discount)
        setDiscountPercent(data.discountPercent || 0)
        saveDiscountToSession(discountCode, data.discount, data.discountPercent || 0)
        setDiscountError('')
      }
    } catch {
      setDiscountError('Error al verificar código')
    } finally {
      setVerifying(false)
    }
  }

  function removeDiscount() {
    setDiscount(null)
    setDiscountPercent(0)
    setDiscountCode('')
    setDiscountError('')
    clearDiscountFromSession()
  }

  const total = discount ? Math.max(0, subtotal - discount) : subtotal

  if (items.length === 0) {
    return (
      <div data-testid="cart-empty" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Explora nuestros recursos y agrega los que necesites.</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar recursos</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Seguir explorando
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Carrito de compras</h1>

      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.id} data-testid="cart-item" className="card p-4 flex items-center justify-between">
            <div>
              <h2 className="font-medium text-gray-900">{item.title}</h2>
              <p className="text-sm text-gray-500">{item.courseName}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-primary-600">{formatClp(item.priceClp)}</span>
              <button data-testid="remove-cart-item" onClick={() => handleRemove(item.id)} aria-label={`Eliminar ${item.title} del carrito`} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">¿Tienes un código de descuento?</h2>
        <div className="flex gap-2">
          <label htmlFor="discount-code-input" className="sr-only">Código de descuento</label>
          <input
            id="discount-code-input"
            data-testid="discount-input"
            type="text"
            value={discountCode}
            onChange={e => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Ingresa tu código"
            className="input-field flex-1 uppercase"
            disabled={discount !== null}
          />
          {discount !== null ? (
            <button data-testid="remove-discount" onClick={removeDiscount} className="btn-secondary inline-flex items-center gap-1 text-sm">
              <X size={14} /> Quitar
            </button>
          ) : (
            <button data-testid="apply-discount" onClick={verifyCode} disabled={verifying || !discountCode.trim()} className="btn-primary text-sm disabled:opacity-50">
              {verifying ? '...' : 'Aplicar'}
            </button>
          )}
        </div>
        {discountError && <p className="text-xs text-red-600 mt-2">{discountError}</p>}
      </div>

      <div className="card p-6">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700">{formatClp(subtotal)}</span>
          </div>
          {discount !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-green-600"><Percent size={14} /> Descuento ({discountPercent}%)</span>
              <span className="text-green-600">-{formatClp(discount)}</span>
            </div>
          )}
        </div>
        <div className="border-t pt-3 flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-primary-600">{formatClp(total)}</span>
        </div>
        <Link data-testid="go-to-checkout" href="/checkout" className="btn-primary w-full text-center block">Ir a pagar</Link>
        <p className="text-xs text-gray-400 text-center mt-2">Pago seguro vía Webpay o Flow</p>
      </div>
    </div>
  )
}
