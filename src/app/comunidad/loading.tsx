export default function ComunidadLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
            <div className="mt-2 h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
