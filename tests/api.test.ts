import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

describe('GET /api/catalog', () => {
  it('retorna recursos y cursos', async () => {
    const res = await fetch(`${BASE}/api/catalog`)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.resources).toBeInstanceOf(Array)
    expect(data.courses).toBeInstanceOf(Array)
  })

  it('cada recurso tiene campos esenciales', async () => {
    const res = await fetch(`${BASE}/api/catalog`)
    const { resources } = await res.json()
    if (resources.length > 0) {
      const r = resources[0]
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('title')
      expect(r).toHaveProperty('resourceType')
      expect(r).toHaveProperty('courseName')
    }
  })
})

describe('GET /api/resources', () => {
  it('lista recursos', async () => {
    const res = await fetch(`${BASE}/api/resources`)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.resources).toBeInstanceOf(Array)
  })
})

describe('GET /api/resources/[id]', () => {
  it('retorna 404 para id inexistente', async () => {
    const res = await fetch(`${BASE}/api/resources/invalid-id-xyz`)
    expect(res.status).toBe(404)
  })
})

describe('GET /api/tags', () => {
  it('retorna lista de tags', async () => {
    const res = await fetch(`${BASE}/api/tags`)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.tags).toBeInstanceOf(Array)
  })
})

describe('GET /api/instagram', () => {
  it('retorna posts de instagram', async () => {
    const res = await fetch(`${BASE}/api/instagram`)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(data.posts ?? data)).toBe(true)
  })
})

describe('GET /api/downloads', () => {
  it('requiere autenticación', async () => {
    const res = await fetch(`${BASE}/api/downloads`)
    expect([401, 404]).toContain(res.status)
  })
})

describe('GET /api/orders/count', () => {
  it('requiere autenticación', async () => {
    const res = await fetch(`${BASE}/api/orders/count`)
    expect([401, 404]).toContain(res.status)
  })
})