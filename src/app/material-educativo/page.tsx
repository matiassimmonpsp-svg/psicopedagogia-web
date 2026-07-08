'use client'

import { ResourceCard } from '@/components/ResourceCard'
import { useCatalog } from '@/lib/hooks'

export default function EducationalMaterialPage() {
  const { resources: allResources, loading, refresh } = useCatalog()

  const materials = allResources.filter(r => r.resourceType === 'educational')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Material Educativo</h1>
      <p className="text-gray-500 mb-8">Fichas de apoyo, cuadernillos y recursos didácticos complementarios para el aula.</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-xl" /></div>)}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Próximamente más material educativo disponible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {materials.map(r => <ResourceCard key={r.id} resource={r} onUpdate={refresh} />)}
        </div>
      )}
    </div>
  )
}
