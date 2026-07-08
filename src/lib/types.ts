// Tipos compartidos para el carrito de compras
export interface CartItem {
  id: string       // ID del recurso
  title: string
  priceClp: number
  courseName: string
}

// Respuesta estándar de la API
export interface ApiResponse<T = unknown> {
  success?: boolean
  error?: string
  message?: string
  data?: T
}

// Elemento de descarga (desde /api/downloads)
export interface DownloadItem {
  id: string
  resourceId: string
  title: string
  courseName: string | null
  courseSlug: string | null
  courseId: number
  areaSlug: string | null
  areaId: number
  resourceType: string
  date: string
  type: 'purchased' | 'free'
}
