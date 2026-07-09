import Link from 'next/link'

export default function Forbidden() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acceso denegado</h2>
        <p className="text-gray-500 mb-8">No tienes permisos para acceder a esta página.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Iniciar sesión con otra cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}
