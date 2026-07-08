'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { CreditCard, Shield, ArrowLeft, ShoppingBag, Percent, Loader2 } from 'lucide-react'
import { formatClp } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [method, setMethod] = useState<'webpay' | 'flow' | 'transfer'>('webpay')
  const [discount, setDiscount] = useState<number | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const savedCode = sessionStorage.getItem('discountCode')
    const savedDiscount = sessionStorage.getItem('discountAmount')
    const savedPercent = sessionStorage.getItem('discountPercent')
    if (savedCode && savedDiscount) {
      setDiscountCode(savedCode)
      setDiscount(Number(savedDiscount))
      setDiscountPercent(Number(savedPercent) || 0)
    }
  }, [])

  const total = discount ? Math.max(0, subtotal - discount) : subtotal

  const handlePay = async () => {
    if (paying) return
    setPaying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, priceClp: i.priceClp })),
          paymentMethod: method,
          discountCode: discountCode || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Error al procesar el pago')
        return
      }
      await clearCart()
      sessionStorage.removeItem('discountCode')
      sessionStorage.removeItem('discountAmount')
      sessionStorage.removeItem('discountPercent')
      toast.success('¡Compra realizada con éxito!')
      router.push('/mis-descargas')
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setPaying(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No hay productos para pagar</h1>
        <p className="text-gray-500 mb-6">Agrega recursos al carrito antes de continuar.</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar recursos</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/carrito" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Volver al carrito
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.title}</span>
              <span className="font-medium">{formatClp(item.priceClp)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatClp(subtotal)}</span></div>
          {discount !== null && (
            <div className="flex justify-between"><span className="flex items-center gap-1 text-green-600"><Percent size={14} /> Descuento ({discountPercent}% - {discountCode})</span><span className="text-green-600">-{formatClp(discount)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-gray-500">IVA incluido</span><span className="font-medium">$0</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary-600">{formatClp(total)}</span></div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Medio de pago</h2>
        <div className="space-y-3">
          <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${method === 'webpay' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="method" value="webpay" checked={method === 'webpay'} onChange={() => setMethod('webpay')} className="accent-primary-600" />
            <div><span className="font-medium text-gray-900">Webpay Plus</span><p className="text-xs text-gray-500">Tarjetas de crédito, débito y prepago</p></div>
          </label>
          <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${method === 'flow' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="method" value="flow" checked={method === 'flow'} onChange={() => setMethod('flow')} className="accent-primary-600" />
            <div><span className="font-medium text-gray-900">Flow</span><p className="text-xs text-gray-500">Transferencia, débito o crédito</p></div>
          </label>
          <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${method === 'transfer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="method" value="transfer" checked={method === 'transfer'} onChange={() => setMethod('transfer')} className="accent-primary-600" />
            <div><span className="font-medium text-gray-900">Transferencia bancaria</span><p className="text-xs text-gray-500">Transferencia directa a cuenta Rut</p></div>
          </label>
        </div>
      </div>

      <button onClick={handlePay} disabled={paying} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
        {paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        {paying ? 'Procesando...' : `Pagar ${formatClp(total)}`}
      </button>
      <p className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-3">
        <Shield size={12} /> Pago seguro cifrado SSL
      </p>
    </div>
  )
}
