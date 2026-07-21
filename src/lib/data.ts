// Re-exporta todo desde los módulos desglosados para compatibilidad
export type { Course, Area, Subarea, AreaWithSubareas, SubareaWithCount, Tag, Resource, SocialPost, CartItem, DownloadItem } from './interfaces'
export { courses, areas, subareas, socialPosts, getCourseBySlug } from './mock-data'
