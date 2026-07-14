'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { CartItem } from '@/lib/data'
import { logger } from '@/lib/logger'

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addItem: (item: CartItem) => Promise<string | null>  // null = éxito
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  count: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Proveedor del carrito de compras.
 * Usuarios logueados: sincroniza con la BD (Order status='cart').
 * Invitados: almacena en localStorage.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCart = useCallback(async () => {
    if (!user) {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('cart')
          setItems(stored ? JSON.parse(stored) : [])
        }
      } catch (err) { console.warn('Error al parsear carrito del localStorage:', err)
        setItems([])
      }
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
} catch (err) {
        logger.error('Error al cargar carrito', { error: err })
      }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const guardarLocal = useCallback((newItems: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(newItems))
    }
    setItems(newItems)
  }, [])

  const addItem = useCallback(async (item: CartItem): Promise<string | null> => {
    if (!user) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
      const cart: CartItem[] = stored ? JSON.parse(stored) : []
      if (!cart.some((i: CartItem) => i.id === item.id)) {
        cart.push(item)
        guardarLocal(cart)
      }
      return null
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: item.id, priceClp: item.priceClp }),
      })
      if (!res.ok) {
        const data = await res.json()
        return data.error || 'Error al agregar al carrito'
      }
      await fetchCart()
      return null
    } catch {
      return 'Error de conexión'
    }
  }, [user, fetchCart, guardarLocal])

  const removeItem = useCallback(async (id: string) => {
    if (!user) {
      guardarLocal(items.filter(i => i.id !== id))
      return
    }
    try {
      await fetch(`/api/cart/${id}`, { method: 'DELETE' })
      await fetchCart()
} catch (err) {
        logger.error('Error al eliminar del carrito', { error: err })
      }
  }, [user, items, fetchCart, guardarLocal])

  const clearCart = useCallback(async () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart')
      }
      setItems([])
      return
    }
    try {
      await fetch('/api/cart/clear', { method: 'DELETE' })
      await fetchCart()
} catch (err) {
        logger.error('Error al vaciar carrito', { error: err })
      }
  }, [user, fetchCart])

  const count = items.length
  const subtotal = items.reduce((s, i) => s + i.priceClp, 0)

  return (
    <CartContext.Provider value={{ items, loading, addItem, removeItem, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
