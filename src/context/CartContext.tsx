'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { CartItem } from '@/lib/types'

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
        const stored = localStorage.getItem('cart')
        setItems(stored ? JSON.parse(stored) : [])
      } catch { setItems([]) }
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
    } catch { console.error('Error al cargar carrito') }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const guardarLocal = useCallback((items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items))
    setItems(items)
  }, [])

  const addItem = useCallback(async (item: CartItem): Promise<string | null> => {
    if (!user) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
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
    await fetch(`/api/cart/${id}`, { method: 'DELETE' })
    await fetchCart()
  }, [user, items, fetchCart, guardarLocal])

  const clearCart = useCallback(async () => {
    if (!user) {
      localStorage.removeItem('cart')
      setItems([])
      return
    }
    await Promise.all(items.map(i => fetch(`/api/cart/${i.id}`, { method: 'DELETE' })))
    await fetchCart()
  }, [user, items, fetchCart])

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
