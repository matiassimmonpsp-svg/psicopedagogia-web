'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { ArrowRight, BookOpen, Brain, Search, Shield } from 'lucide-react'
import { ResourceCard } from '@/components/ResourceCard'
import { SearchBar } from '@/components/SearchBar'
import { InstagramWidget } from '@/components/InstagramWidget'
import { courses, areas } from '@/lib/data'
import type { Resource } from '@/lib/data'

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/catalog')
      const data = await res.json()
      setResources(data.resources || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchResources() }, [fetchResources])

  const featuredResources = resources.filter(r => r.isFree).slice(0, 4)
  const premiumResources = resources.filter(r => !r.isFree).slice(0, 4)

  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Material de evaluación psicopedagógica para profesionales en Chile
            </h1>
            <p className="text-lg text-primary-100 mb-8">
              Instrumentos de evaluación informal desde Prekínder hasta 8° Básico en las áreas de lectoescritura, pensamiento lógico matemático y habilidades cognitivas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link href="/registro" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
                Comenzar ahora <ArrowRight size={18} />
              </Link>
              <Link href="/cursos/prekinder" className="text-white border border-white/30 px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Explorar recursos
              </Link>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-5 sm:grid-cols-10 gap-2">
            {courses.map(c => (
              <Link key={c.id} href={`/cursos/${c.slug}`} className="bg-white/10 hover:bg-white/20 rounded-lg p-2 text-center transition-colors">
                <span className="text-[10px] sm:text-xs font-medium block leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="card p-2 flex items-center gap-2 shadow-lg">
          <SearchBar large />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Basado en el sistema chileno</h3>
            <p className="text-sm text-gray-500">Contenido organizado por curso desde Prekínder hasta 8° Básico, alineado con el currículum nacional.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-secondary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Evaluación informal</h3>
            <p className="text-sm text-gray-500">Instrumentos diseñados por profesionales para la evaluación psicopedagógica en contexto educativo.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain size={24} className="text-accent-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tres áreas clave</h3>
            <p className="text-sm text-gray-500">Lectoescritura, pensamiento lógico matemático y habilidades cognitivas con sus respectivas subáreas.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {areas.map(a => (
            <Link key={a.id} href={`/buscar?area=${a.slug}`} className="bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-700 rounded-full px-5 py-2 text-sm font-medium text-gray-600 transition-colors">
              {a.name}
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-xl" /><div className="mt-3 h-4 bg-gray-200 rounded w-3/4" /><div className="mt-2 h-3 bg-gray-100 rounded w-1/2" /></div>)}
          </div>
        </section>
      ) : (
        <>
          {featuredResources.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="section-title">Recursos gratuitos</h2>
                <Link href="/buscar?gratis=true" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">Ver todos <ArrowRight size={14} /></Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredResources.map(r => <ResourceCard key={r.id} resource={r} onUpdate={fetchResources} />)}
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
                  {premiumResources.map(r => <ResourceCard key={r.id} resource={r} onUpdate={fetchResources} />)}
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
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="tu@correo.com" className="input-field flex-1" />
            <button type="submit" className="bg-white text-primary-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-50 transition-colors">Suscribirme</button>
          </form>
        </div>
      </section>
    </>
  )
}
