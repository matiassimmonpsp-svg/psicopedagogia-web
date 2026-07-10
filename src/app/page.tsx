import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, Shield } from 'lucide-react'
import { courses, areas } from '@/lib/mock-data'
import { SearchBar } from '@/components/SearchBar'
import { HomeContent } from '@/components/HomeContent'

export default function Home() {
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

      <HomeContent />
    </>
  )
}
