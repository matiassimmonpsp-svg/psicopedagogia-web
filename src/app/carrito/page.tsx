'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Trash2, ShoppingBag, ArrowLeft, Percent, X } from 'lucide-react'
import { formatClp } from '@/lib/utils'

interface CartItem {
  id: string
  title: string
  priceClp: number
  courseName: string
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState<number | null>(null)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [discountError, setDiscountError] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch {}
    }
    const savedCode = sessionStorage.getItem('discountCode')
    const savedDiscount = sessionStorage.getItem('discountAmount')
    const savedPercent = sessionStorage.getItem('discountPercent')
    if (savedCode && savedDiscount) {
      setDiscountCode(savedCode)
      setDiscount(Number(savedDiscount))
      setDiscountPercent(Number(savedPercent) || 0)
    }
  }, [])

  function removeItem(id: string) {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  async function verifyCode() {
    if (!discountCode.trim()) return
    setVerifying(true)
    setDiscountError('')
    try {
      const total = items.reduce((sum, i) => sum + i.priceClp, 0)
      const res = await fetch('/api/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', code: discountCode, cartTotal: total }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDiscountError(data.error || 'Código no válido')
        setDiscount(null)
        setDiscountPercent(0)
        sessionStorage.removeItem('discountCode')
        sessionStorage.removeItem('discountAmount')
        sessionStorage.removeItem('discountPercent')
      } else {
        setDiscount(data.discount)
        setDiscountPercent(data.discountPercent)
        sessionStorage.setItem('discountCode', data.code)
        sessionStorage.setItem('discountAmount', String(data.discount))
        sessionStorage.setItem('discountPercent', String(data.discountPercent))
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
    sessionStorage.removeItem('discountCode')
    sessionStorage.removeItem('discountAmount')
    sessionStorage.removeItem('discountPercent')
  }

  const subtotal = items.reduce((sum, i) => sum + i.priceClp, 0)
  const total = discount ? Math.max(0, subtotal - discount) : subtotal

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
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
          <div key={item.id} className="card p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.courseName}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-primary-600">{formatClp(item.priceClp)}</span>
              <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">¿Tienes un código de descuento?</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={e => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Ingresa tu código"
            className="input-field flex-1 uppercase"
            disabled={discount !== null}
          />
          {discount !== null ? (
            <button onClick={removeDiscount} className="btn-secondary inline-flex items-center gap-1 text-sm">
              <X size={14} /> Quitar
            </button>
          ) : (
            <button onClick={verifyCode} disabled={verifying || !discountCode.trim()} className="btn-primary text-sm disabled:opacity-50">
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
        <Link href="/checkout" className="btn-primary w-full text-center block">Ir a pagar</Link>
        <p className="text-xs text-gray-400 text-center mt-2">Pago seguro vía Webpay o Flow</p>
      </div>
    </div>
  )
}
