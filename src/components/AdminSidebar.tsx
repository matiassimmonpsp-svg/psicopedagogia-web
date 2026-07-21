'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, PlusCircle, Percent, Users, Layers, ChevronLeft, ChevronRight } from 'lucide-react'

/** Links de navegación del panel de administración */
const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/nuevo-recurso', label: 'Nueva Entrada', icon: PlusCircle },
  { href: '/admin/recursos', label: 'Recursos', icon: FileText },
  { href: '/admin/areas', label: 'Áreas y Subáreas', icon: Layers },
  { href: '/admin/descuentos', label: 'Descuentos', icon: Percent },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
]

/**
 * Barra lateral del panel de administración.
 *
 * Muestra los enlaces de navegación del admin (Dashboard, Nueva Entrada, Recursos,
 * Descuentos, Usuarios). Resalta el enlace activo según la ruta actual.
 * Se puede colapsar/expandir mediante un botón toggle, mostrando solo iconos
 * cuando está colapsada. Solo es visible en pantallas medianas o superiores (md+).
 */
export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <aside aria-label="Panel de administración" className={`bg-white border-r border-gray-200 min-h-[80vh] hidden md:block transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-3">
          <div className="flex items-center mb-4">
            {!collapsed && <p className="flex-1 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Panel de administración</p>}
            <button type="button" aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'} onClick={() => setCollapsed(!collapsed)} className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${collapsed ? 'mx-auto' : ''}`}>
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          <nav className="space-y-1">
            {links.map(l => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'} ${collapsed ? 'justify-center' : ''}`}
                  aria-label={collapsed ? l.label : undefined}
                >
                  <l.icon size={18} />
                  {!collapsed && l.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
      <nav className="md:hidden bg-white border-b border-gray-200 overflow-x-auto" aria-label="Navegación del admin">
        <div className="flex gap-1 p-2 min-w-max">
          {links.map(l => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <l.icon size={14} />
                {l.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
