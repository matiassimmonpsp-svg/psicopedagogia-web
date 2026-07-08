import { describe, it, expect } from 'vitest'
import {
  courses, areas, subareas, allTags, allResources, socialPosts,
  getCourseBySlug, searchResources,
} from '@/lib/data'

describe('mock data structure', () => {
  it('courses tiene al menos 10 niveles', () => {
    expect(courses.length).toBeGreaterThanOrEqual(10)
  })

  it('areas tiene 3 áreas principales', () => {
    expect(areas.length).toBe(3)
  })

  it('subareas tiene al menos 30 subáreas', () => {
    expect(subareas.length).toBeGreaterThanOrEqual(30)
  })

  it('allTags tiene al menos 20 tags', () => {
    expect(allTags.length).toBeGreaterThanOrEqual(20)
  })

  it('allResources tiene al menos 30 recursos', () => {
    expect(allResources.length).toBeGreaterThanOrEqual(30)
  })

  it('socialPosts tiene al menos 2 posts', () => {
    expect(socialPosts.length).toBeGreaterThanOrEqual(2)
  })

  it('cada recurso tiene campos obligatorios', () => {
    for (const r of allResources) {
      expect(r.id).toBeTruthy()
      expect(r.title).toBeTruthy()
      expect(r.description).toBeTruthy()
      expect(['evaluation', 'educational']).toContain(r.resourceType)
      expect(typeof r.isFree).toBe('boolean')
      expect(r.tags).toBeInstanceOf(Array)
    }
  })

  it('recursos gratis tienen priceClp null', () => {
    for (const r of allResources.filter(r => r.isFree)) {
      expect(r.priceClp).toBeNull()
    }
  })

  it('recursos de pago tienen priceClp > 0', () => {
    for (const r of allResources.filter(r => !r.isFree)) {
      expect(r.priceClp).toBeGreaterThan(0)
    }
  })

  it('cada subarea referencia un area válida', () => {
    const areaIds = new Set(areas.map(a => a.id))
    for (const s of subareas) {
      expect(areaIds.has(s.areaId)).toBe(true)
    }
  })
})

describe('getCourseBySlug', () => {
  it('encuentra por slug', () => {
    const c = getCourseBySlug('1-basico')
    expect(c).toBeDefined()
    expect(c!.name).toBe('1° Básico')
  })

  it('retorna undefined para slug inexistente', () => {
    expect(getCourseBySlug('no-existe')).toBeUndefined()
  })
})

describe('searchResources', () => {
  it('busca por título', () => {
    const { results } = searchResources('conciencia fonológica')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.title.toLowerCase().includes('conciencia'))).toBe(true)
  })

  it('retorna vacío para query vacía', () => {
    const { results, suggestions } = searchResources('')
    expect(results).toEqual([])
    expect(suggestions).toEqual([])
  })

  it('incluye sugerencias', () => {
    const { suggestions } = searchResources('fluidez lectora')
    expect(suggestions).toBeInstanceOf(Array)
  })
})
