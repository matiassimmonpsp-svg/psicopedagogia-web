'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { CartItem } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addItem: (item: CartItem) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  count: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

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
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      } else {
        setItems([])
      }
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const saveLocalCart = useCallback((newItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newItems))
    setItems(newItems)
  }, [])

  const addItem = useCallback(async (item: CartItem) => {
    if (!user) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      if (!cart.some((i: CartItem) => i.id === item.id)) {
        cart.push(item)
        saveLocalCart(cart)
      }
      return
    }
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId: item.id, priceClp: item.priceClp, title: item.title, courseName: item.courseName }),
    })
    await fetchCart()
  }, [user, fetchCart, saveLocalCart])

  const removeItem = useCallback(async (id: string) => {
    if (!user) {
      saveLocalCart(items.filter(i => i.id !== id))
      return
    }
    await fetch(`/api/cart/${id}`, { method: 'DELETE' })
    await fetchCart()
  }, [user, items, fetchCart, saveLocalCart])

  const clearCart = useCallback(async () => {
    if (!user) {
      localStorage.removeItem('cart')
      setItems([])
      return
    }
    const ids = items.map(i => i.id)
    await Promise.all(ids.map(id => fetch(`/api/cart/${id}`, { method: 'DELETE' })))
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
