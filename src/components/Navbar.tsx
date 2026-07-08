'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown, ShoppingCart, Search, User, LogOut } from 'lucide-react'
import { courses } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export function Navbar() {
  const { user, loading, logout } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [coursesOpen, setCoursesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
            <div className="relative group">
              <button
                onClick={() => setCoursesOpen(!coursesOpen)}
                className="flex items-center gap-1 text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
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
            <Link href="/buscar" className="text-gray-600 hover:text-primary-600 transition-colors"><Search size={20} /></Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/carrito" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
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
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-700">{user.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mi Perfil</Link>
                    <Link href="/mis-descargas" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mis Descargas</Link>
                    {user.role === 'admin' && <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Panel Admin</Link>}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { setUserMenuOpen(false); logout() }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm">Ingresar</Link>
            )}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ) : null}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cursos</p>
              {courses.map(c => (
                <Link key={c.id} href={`/cursos/${c.slug}`} className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={() => setMenuOpen(false)}>{c.name}</Link>
              ))}
            </div>
            <Link href="/catalogo" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={() => setMenuOpen(false)}>Catálogo</Link>
            <Link href="/material-educativo" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={() => setMenuOpen(false)}>Material Educativo</Link>
            <Link href="/comunidad" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={() => setMenuOpen(false)}>Comunidad</Link>
            <Link href="/buscar" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={() => setMenuOpen(false)}>Buscar</Link>
            {user ? (
              <>
                <hr className="border-gray-100" />
                <Link href="/perfil" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={() => setMenuOpen(false)}>Mi Perfil</Link>
                <Link href="/mis-descargas" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={() => setMenuOpen(false)}>Mis Descargas</Link>
                {user.role === 'admin' && <Link href="/admin" className="block py-1.5 text-primary-600 font-medium" onClick={() => setMenuOpen(false)}>Panel Admin</Link>}
                <button onClick={() => { setMenuOpen(false); logout() }} className="block w-full text-left py-1.5 text-red-600">Cerrar sesión</button>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-center block mt-4" onClick={() => setMenuOpen(false)}>Ingresar</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
