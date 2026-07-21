export default function ResourceLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-4/5 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
