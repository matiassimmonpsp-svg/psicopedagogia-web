export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
            <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
            <div className="mt-2 h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
