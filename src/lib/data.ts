// Re-exporta todo desde los módulos desglosados para compatibilidad
export type { Course, Area, Subarea, Tag, Resource, SocialPost, CatalogResource, CartItem, ApiResponse, DownloadItem } from './interfaces'
export { courses, areas, subareas, allTags, allResources, socialPosts, getCourseBySlug } from './mock-data'
export { searchResources } from './search'
