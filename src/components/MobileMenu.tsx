'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { courses } from '@/lib/data'
import type { AuthUser } from '@/lib/auth'

interface MobileMenuProps {
  user: AuthUser | null
  logout: () => void
  onClose: () => void
}

export function MobileMenu({ user, logout, onClose }: MobileMenuProps) {
  return (
    <nav className="md:hidden border-t border-gray-100 bg-white" aria-label="Navegación móvil">
      <div className="px-4 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cursos</p>
          {courses.map(c => (
            <Link key={c.id} href={`/cursos/${c.slug}`} className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={onClose}>{c.name}</Link>
          ))}
        </div>
        <Link href="/catalogo" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={onClose}>Catálogo</Link>
        <Link href="/material-educativo" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={onClose}>Material Educativo</Link>
        <Link href="/comunidad" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={onClose}>Comunidad</Link>
        <Link href="/buscar" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={onClose}>Buscar</Link>
        {user ? (
          <>
            <hr className="border-gray-100" />
            <Link href="/perfil" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={onClose}>Mi Perfil</Link>
            <Link href="/mis-descargas" className="block py-1.5 text-gray-700 hover:text-primary-600" onClick={onClose}>Mis Descargas</Link>
            {user.role === 'admin' && <Link href="/admin" className="block py-1.5 text-primary-600 font-medium" onClick={onClose}>Panel Admin</Link>}
            <button onClick={() => { onClose(); logout() }} className="block w-full text-left py-1.5 text-red-600">Cerrar sesión</button>
          </>
        ) : (
          <Link href="/login" className="btn-primary text-center block mt-4" onClick={onClose}>Ingresar</Link>
        )}
      </div>
    </nav>
  )
}
