'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { Search } from 'lucide-react'

/**
 * Barra de búsqueda reutilizable.
 *
 * Permite al usuario ingresar un término de búsqueda y redirige a la página
 * de resultados (/buscar?q=...). Soporta variantes de tamaño (grande/pequeño)
 * y acepta clases CSS adicionales para personalización.
 *
 * @param large - Si es true, muestra una versión más grande del input.
 * @param className - Clases CSS adicionales para el contenedor del formulario.
 */
export function SearchBar({ large = false, className = '' }: { large?: boolean; className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <label htmlFor={large ? 'search-large' : 'search-small'} className="sr-only">Buscar</label>
      <Search size={large ? 20 : 16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        id={large ? 'search-large' : 'search-small'}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar material, evaluación, curso..."
        className={`w-full pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${large ? 'py-3 text-base' : 'py-2 text-sm'}`}
      />
    </form>
  )
}
