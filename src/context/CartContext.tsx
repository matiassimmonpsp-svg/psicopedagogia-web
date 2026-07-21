'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { CartItem } from '@/lib/data'
import { csrfFetch } from '@/lib/csrf-client'
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

let cartMutex = Promise.resolve()

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
      } catch (err) {
        logger.warn('Error al parsear carrito del localStorage', { error: String(err) })
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
      logger.error('Error al cargar carrito', { error: err instanceof Error ? err.message : String(err) })
    } finally {
      setLoading(false)
    }
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
      return new Promise<string | null>((resolve) => {
        cartMutex = cartMutex.then(async () => {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
          const cart: CartItem[] = stored ? JSON.parse(stored) : []
          if (!cart.some((i: CartItem) => i.id === item.id)) {
            cart.push(item)
            guardarLocal(cart)
          }
          resolve(null)
        })
      })
    }
    try {
      const res = await csrfFetch('/api/cart', {
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
      setItems(prev => {
        const newItems = prev.filter(i => i.id !== id)
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(newItems))
        }
        return newItems
      })
      return
    }
    try {
      await csrfFetch(`/api/cart/${id}`, { method: 'DELETE' })
      await fetchCart()
    } catch (err) {
      logger.error('Error al eliminar del carrito', { error: err instanceof Error ? err.message : String(err) })
    }
  }, [user, fetchCart])

  const clearCart = useCallback(async () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart')
      }
      setItems([])
      return
    }
    try {
      await csrfFetch('/api/cart/clear', { method: 'DELETE' })
      await fetchCart()
    } catch (err) {
      logger.error('Error al vaciar carrito', { error: err instanceof Error ? err.message : String(err) })
    }
  }, [user, fetchCart])

  const count = items.length
  const subtotal = items.reduce((s, i) => s + (i.priceClp ?? 0), 0)

  const value = useMemo(() => ({
    items, loading, addItem, removeItem, clearCart, count, subtotal,
  }), [items, loading, addItem, removeItem, clearCart, count, subtotal])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
