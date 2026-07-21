'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import type { AuthUser } from '@/lib/auth'

interface UserMenuProps {
  user: AuthUser
  logout: () => void
}

export function UserMenu({ user, logout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-expanded={open} aria-haspopup="true" aria-label="Menú de usuario">
        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-primary-700">{user.name.charAt(0)}</span>
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name.split(' ')[0]}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <Link href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>Mi Perfil</Link>
          <Link href="/mis-descargas" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>Mis Descargas</Link>
          {user.role === 'admin' && <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>Panel Admin</Link>}
          <hr className="my-1 border-gray-100" />
          <button onClick={() => { setOpen(false); logout() }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
