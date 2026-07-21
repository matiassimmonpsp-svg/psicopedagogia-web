export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  )
}
