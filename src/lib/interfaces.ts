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

// ============================================================
// Recurso unificado — usado en catálogo, detalle, carrito, etc.
// Combina lo que antes eran Resource + CatalogResource + ResourceDetail
// ============================================================
export interface Resource {
  id: string
  title: string
  description: string
  filePath: string
  previewPath: string
  editablePath?: string | null
  resourceType: 'evaluation' | 'educational'
  isFree: boolean
  priceClp: number | null
  promoFreeUntil?: string | null
  courseId: number
  areaId: number
  subareaId: number | null
  downloadsCount: number
  isActive?: boolean
  isOwned?: boolean
  createdAt?: string
  updatedAt?: string
  // Relaciones planas para el frontend
  courseName: string
  courseSlug?: string
  areaName: string
  areaSlug?: string
  subareaName?: string | null
  subareaSlug?: string | null
  tags: string[]
  source?: 'db' | 'mock'
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

// Tipos compartidos para el carrito de compras
export interface CartItem {
  id: string
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
  isActive?: boolean
}
