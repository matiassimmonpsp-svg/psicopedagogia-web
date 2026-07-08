import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
  await prisma.$connect()
})

describe('conexión a BD', () => {
  it('se conecta correctamente', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as ok`
    expect(result).toBeDefined()
  })
})

describe('modelo User', () => {
  it('existe la tabla users', async () => {
    const count = await prisma.user.count()
    expect(typeof count).toBe('number')
    expect(count).toBeGreaterThanOrEqual(0)
  })

  it('tiene los campos esperados', async () => {
    const first = await prisma.user.findFirst()
    if (first) {
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('email')
      expect(first).toHaveProperty('passwordHash')
      expect(first).toHaveProperty('role')
    }
  })
})

describe('modelo Course', () => {
  it('tiene cursos con slug único', async () => {
    const cursos = await prisma.course.findMany()
    const slugs = cursos.map(c => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('modelo Area', () => {
  it('tiene áreas con slug único', async () => {
    const areas = await prisma.area.findMany()
    const slugs = areas.map(a => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('modelo Resource', () => {
  it('tiene recursos registrados', async () => {
    const count = await prisma.resource.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  it('isFree es booleano', async () => {
    const r = await prisma.resource.findFirst()
    if (r) {
      expect(typeof r.isFree).toBe('boolean')
    }
  })

  it('recursos gratis tienen priceClp null', async () => {
    const freeResources = await prisma.resource.findMany({ where: { isFree: true } })
    for (const r of freeResources) {
      expect(r.priceClp).toBeNull()
    }
  })

  it('recursos de pago tienen priceClp > 0', async () => {
    const paidResources = await prisma.resource.findMany({ where: { isFree: false } })
    for (const r of paidResources) {
      expect(r.priceClp).toBeGreaterThan(0)
    }
  })
})

describe('modelo Tag', () => {
  it('tiene tags con nombre único', async () => {
    const tags = await prisma.tag.findMany()
    const names = tags.map(t => t.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('modelo DiscountCode', () => {
  it('tiene códigos con code único', async () => {
    const codes = await prisma.discountCode.findMany()
    const codesStr = codes.map(c => c.code)
    expect(new Set(codesStr).size).toBe(codesStr.length)
  })
})

describe('modelo SocialPost', () => {
  it('existe la tabla social_posts', async () => {
    const count = await prisma.socialPost.count()
    expect(typeof count).toBe('number')
  })
})

describe('relaciones', () => {
  it('cada resource tiene un curso y área', async () => {
    const resources = await prisma.resource.findMany({ take: 5 })
    for (const r of resources) {
      expect(r.courseId).toBeGreaterThan(0)
      expect(r.areaId).toBeGreaterThan(0)
    }
  })

  it('subareas referencian áreas existentes', async () => {
    const subareas = await prisma.subarea.findMany()
    const areaIds = new Set((await prisma.area.findMany()).map(a => a.id))
    for (const s of subareas) {
      expect(areaIds.has(s.areaId)).toBe(true)
    }
  })
})
