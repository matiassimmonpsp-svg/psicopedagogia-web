export default function CheckoutLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
