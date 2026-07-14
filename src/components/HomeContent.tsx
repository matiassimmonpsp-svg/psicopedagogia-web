'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'
import { ResourceCard } from '@/components/ResourceCard'
import { InstagramWidget } from '@/components/InstagramWidget'
import type { Resource } from '@/lib/interfaces'
import { useCatalog } from '@/lib/hooks'
import { useAuth } from '@/context/AuthContext'

/**
 * Contenido principal de la página de inicio.
 *
 * Carga y muestra los recursos gratuitos destacados (hasta 4) y los recursos
 * premium destacados (hasta 4), cada uno en su sección con enlace a "Ver todos".
 * Incluye un widget de Instagram y una sección de suscripción al newsletter.
 * Muestra estados de carga con placeholders animados (skeleton).
 */
export function HomeContent() {
  const { resources, loading, refresh, updateResource } = useCatalog()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [email, setEmail] = useState('')

  const visibleResources = resources.filter((r: Resource) => isAdmin || r.isActive !== false)
  const featuredResources = visibleResources.filter((r: Resource) => r.isFree).slice(0, 4)
  const premiumResources = visibleResources.filter((r: Resource) => !r.isFree).slice(0, 4)

  return (
    <>
      {loading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-xl" /><div className="mt-3 h-4 bg-gray-200 rounded w-3/4" /><div className="mt-2 h-3 bg-gray-100 rounded w-1/2" /></div>)}
          </div>
        </section>
      ) : (
        <>
          {featuredResources.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="section-title">Recursos gratuitos</h2>
                <Link href="/buscar?gratis=true" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">Ver todos <ArrowRight size={14} /></Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredResources.map((r: Resource) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />)}
              </div>
            </section>
          )}

          {premiumResources.length > 0 && (
            <section className="bg-gray-100 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="section-title">Material premium destacado</h2>
                  <Link href="/buscar?premium=true" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">Ver todos <ArrowRight size={14} /></Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {premiumResources.map((r: Resource) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />)}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InstagramWidget />
      </div>

      <section className="bg-primary-600 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Recibe material gratis cada mes</h2>
          <p className="text-primary-100 mb-6">Suscríbete a nuestro newsletter y recibe instrumentos de evaluación gratuitos directamente en tu correo.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => { e.preventDefault(); if (email) { toast.success('¡Gracias por suscribirte! Pronto recibirás material en tu correo.'); setEmail('') } }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" className="input-field flex-1" required />
            <button type="submit" className="bg-white text-primary-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-50 transition-colors">Suscribirme</button>
          </form>
        </div>
      </section>
    </>
  )
}
