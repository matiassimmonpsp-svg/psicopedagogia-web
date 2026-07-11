// ============================================================
// Interfaces compartidas del dominio
// ============================================================

export interface Course {
  id: number
  name: string
  slug: string
  sortOrder: number
}

export interface Area {
  id: number
  name: string
  slug: string
  sortOrder: number
}

export interface Subarea {
  id: number
  areaId: number
  name: string
  slug: string
}

export interface Resource {
  id: string
  title: string
  description: string
  filePath: string
  previewPath: string
  resourceType: 'evaluation' | 'educational'
  isFree: boolean
  priceClp: number | null
  promoFreeUntil?: string | null
  courseId: number
  areaId: number
  subareaId: number | null
  downloadsCount: number
  isActive?: boolean
  courseName?: string
  courseSlug?: string
  areaName?: string
  areaSlug?: string
  subareaName?: string
  tags: string[]
  isOwned?: boolean
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface SocialPost {
  id: number
  mediaUrl: string
  caption: string
  permalink: string
  postedAt: string
}

/** Resource shape returned by /api/catalog (includes slugs for filtering) */
export interface CatalogResource extends Resource {
  courseSlug?: string
  areaSlug?: string
  subareaSlug?: string
  isOwned?: boolean
  source?: 'db' | 'mock'
}

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
