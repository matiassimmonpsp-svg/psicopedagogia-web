'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, ShoppingCart, Instagram, PlusCircle, Percent } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/nuevo-recurso', label: 'Nueva Entrada', icon: PlusCircle },
  { href: '/admin/recursos', label: 'Recursos', icon: FileText },
  { href: '/admin/descuentos', label: 'Descuentos', icon: Percent },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin', label: 'Órdenes', icon: ShoppingCart },
  { href: '/admin', label: 'Redes Sociales', icon: Instagram },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[80vh] hidden md:block">
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Panel de Administración</p>
        <nav className="space-y-1">
          {links.map(l => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <l.icon size={18} />
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
