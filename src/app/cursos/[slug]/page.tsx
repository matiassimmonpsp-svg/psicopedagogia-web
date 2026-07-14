'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ResourceCard } from '@/components/ResourceCard'
import { courses, areas, subareas, getCourseBySlug, type CatalogResource } from '@/lib/data'
import type { Subarea } from '@/lib/data'
import { useCatalog } from '@/lib/hooks'
import { useAuth } from '@/context/AuthContext'

function getSubareasByArea(areaId: number): Subarea[] {
  return subareas.filter((s: Subarea) => s.areaId === areaId)
}

export default function CoursePage({ params, searchParams }: { params: { slug: string }; searchParams: { area?: string; subarea?: string } }) {
  const course = getCourseBySlug(params.slug)
  const { resources: allCatalog, loading, refresh, updateResource } = useCatalog()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const resources = useMemo(() => {
    if (!course) return []
    return allCatalog.filter((r: CatalogResource) => r.courseSlug === course.slug && (isAdmin || r.isActive !== false))
  }, [allCatalog, course, isAdmin])

  if (!course) notFound()

  const selectedAreaSlug = searchParams.area
  const selectedSubareaSlug = searchParams.subarea
  const selectedArea = selectedAreaSlug ? areas.find(a => a.slug === selectedAreaSlug) : null
  const selectedSubarea = selectedSubareaSlug && selectedArea
    ? subareas.find((s: Subarea) => s.slug === selectedSubareaSlug && s.areaId === selectedArea.id)
    : null

  const filteredResources = resources.filter((r: CatalogResource) => {
    if (selectedAreaSlug && r.areaSlug !== selectedAreaSlug) return false
    if (selectedSubareaSlug && r.subareaSlug !== selectedSubareaSlug) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Volver al inicio
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
      <p className="text-gray-500 mb-8">Material de evaluación psicopedagógica para {course.name}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link href={`/cursos/${course.slug}`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedAreaSlug ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
          Todas las áreas
        </Link>
        {areas.map(a => (
          <Link key={a.slug} href={`/cursos/${course.slug}?area=${a.slug}`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedAreaSlug === a.slug ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
            {a.name}
          </Link>
        ))}
      </div>

      {selectedArea && getSubareasByArea(selectedArea.id).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 ml-1">
          <Link href={`/cursos/${course.slug}?area=${selectedArea.slug}`} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedSubarea ? 'bg-accent-100 text-accent-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Todas las subáreas
          </Link>
          {getSubareasByArea(selectedArea.id).map((s: Subarea) => (
            <Link key={s.id} href={`/cursos/${course.slug}?area=${selectedArea.slug}&subarea=${s.slug}`} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedSubarea?.id === s.id ? 'bg-accent-100 text-accent-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-xl" /></div>)}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No hay recursos disponibles para esta combinación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredResources.map((r: CatalogResource) => <ResourceCard key={r.id} resource={r} onUpdate={refresh} onUpdateResource={updateResource} />)}
        </div>
      )}
    </div>
  )
}
