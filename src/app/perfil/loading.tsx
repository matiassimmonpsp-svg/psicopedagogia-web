export default function PerfilLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="h-12 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="h-12 bg-gray-200 rounded w-80 animate-pulse" />
        <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    </div>
  )
}
