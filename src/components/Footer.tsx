import Link from 'next/link'
import { BookOpen, Heart } from 'lucide-react'

/**
 * Pie de página de la aplicación.
 *
 * Muestra información de la marca (PsicopedagogíaCL), descripción de la plataforma,
 * enlaces de navegación (Explorar) y enlaces de cuenta (Cuenta).
 * Incluye mensaje de derechos reservados con año actual.
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-primary-400" size={24} />
              <span className="font-bold text-lg text-white">Psicopedagogía<span className="text-primary-400">CL</span></span>
            </div>
            <p className="text-sm text-gray-300 max-w-md">
              Plataforma profesional de material e instrumentos de evaluación psicopedagógica para el sistema escolar chileno. Apoyando a profesionales de la educación y la salud.
            </p>
            <p className="flex items-center gap-1 text-sm text-gray-300 mt-4">
              Hecho con <Heart size={14} className="text-red-400" /> para la comunidad psicopedagógica de Chile.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Explorar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/material-educativo" className="hover:text-white transition-colors">Material Educativo</Link></li>
              <li><Link href="/comunidad" className="hover:text-white transition-colors">Comunidad</Link></li>
              <li><Link href="/buscar" className="hover:text-white transition-colors">Buscar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Cuenta</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
              <li><Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
              <li><Link href="/perfil" className="hover:text-white transition-colors">Mi Perfil</Link></li>
              <li><Link href="/mis-descargas" className="hover:text-white transition-colors">Mis Descargas</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
          &copy; {new Date().getFullYear()} PsicopedagogíaCL. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
