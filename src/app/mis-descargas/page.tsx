import { Download, FileText, Clock } from 'lucide-react'
import Link from 'next/link'

export default function DownloadsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Descargas</h1>
      <p className="text-gray-500 mb-8">Historial de recursos descargados</p>

      <div className="card p-8 text-center">
        <Download size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No tienes descargas aún</h2>
        <p className="text-gray-500 text-sm mb-6">Los recursos que descargues aparecerán aquí para que puedas acceder a ellos fácilmente.</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar recursos</Link>
      </div>
    </div>
  )
}
