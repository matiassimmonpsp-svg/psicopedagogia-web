import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const InstagramWidget = dynamic(() => import('@/components/InstagramWidget').then(mod => mod.InstagramWidget), { ssr: false })

export const metadata: Metadata = {
  title: 'Comunidad',
  description: 'Únete a la comunidad de profesionales de la psicopedagogía en Chile. Síguenos para tips educativos, nuevos lanzamientos y contenido exclusivo.',
}

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comunidad</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Síguenos en nuestras redes sociales para tips educativos, nuevos lanzamientos y contenido exclusivo para profesionales de la psicopedagogía.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="card p-6 text-center">
          <InstagramWidget />
        </div>
      </div>
    </div>
  )
}
