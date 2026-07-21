'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'
import { Menu, X, ChevronDown, ShoppingCart, Search } from 'lucide-react'
import { courses } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { UserMenu } from './UserMenu'
import { MobileMenu } from './MobileMenu'

export function Navbar() {
  const { user, loading, logout } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [coursesOpen, setCoursesOpen] = useState(false)

  const closeAll = useCallback(() => {
    setCoursesOpen(false)
    setMenuOpen(false)
  }, [])

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">Psicopedagogía<span className="text-primary-600">CL</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button onClick={() => setCoursesOpen(!coursesOpen)} className="flex items-center gap-1 text-gray-600 hover:text-primary-600 font-medium transition-colors" aria-expanded={coursesOpen} aria-haspopup="true">
                Cursos <ChevronDown size={16} />
              </button>
              {coursesOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 z-50" onMouseLeave={() => setCoursesOpen(false)}>
                  {courses.map(c => (
                    <Link key={c.id} href={`/cursos/${c.slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700" onClick={() => setCoursesOpen(false)}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/catalogo" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Catálogo</Link>
            <Link href="/material-educativo" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Material Educativo</Link>
            <Link href="/comunidad" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Comunidad</Link>
            <Link href="/buscar" className="text-gray-600 hover:text-primary-600 transition-colors" aria-label="Buscar recursos"><Search size={20} /></Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/carrito" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors" aria-label={`Carrito de compras${count > 0 ? `, ${count} items` : ''}`}>
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
            {loading ? (
              <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            ) : user ? (
              <UserMenu user={user} logout={logout} />
            ) : (
              <Link href="/login" className="btn-primary text-sm">Ingresar</Link>
            )}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && <MobileMenu user={user} logout={logout} onClose={closeAll} />}
    </nav>
  )
}
