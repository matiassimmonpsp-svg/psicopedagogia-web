import { describe, it, expect, vi } from 'vitest'

vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({ className: 'inter' })),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'r1', updatedAt: new Date('2026-01-01'), isActive: true },
        { id: 'r2', updatedAt: new Date('2026-06-15'), isActive: true },
      ]),
    },
  },
}))

import sitemap from '@/app/sitemap'
import robots from '@/app/robots'
import { prisma } from '@/lib/prisma'

describe('SEO - Sitemap', () => {
  it('genera entradas para páginas estáticas', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)

    expect(urls).toContain('https://psicopedagogia.cl')
    expect(urls).toContain('https://psicopedagogia.cl/catalogo')
    expect(urls).toContain('https://psicopedagogia.cl/material-educativo')
    expect(urls).toContain('https://psicopedagogia.cl/comunidad')
    expect(urls).toContain('https://psicopedagogia.cl/buscar')
    expect(urls).toContain('https://psicopedagogia.cl/registro')
    expect(urls).toContain('https://psicopedagogia.cl/login')
  })

  it('incluye páginas de cursos', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)

    expect(urls).toContain('https://psicopedagogia.cl/cursos/prekinder')
    expect(urls).toContain('https://psicopedagogia.cl/cursos/1-basico')
    expect(urls).toContain('https://psicopedagogia.cl/cursos/8-basico')
  })

  it('incluye recursos activos desde la DB', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)

    expect(urls).toContain('https://psicopedagogia.cl/recurso/r1')
    expect(urls).toContain('https://psicopedagogia.cl/recurso/r2')
  })

  it('cada entrada tiene prioridad y cambio frecuencia', async () => {
    const entries = await sitemap()
    const home = entries.find(e => e.url === 'https://psicopedagogia.cl')

    expect(home).toBeDefined()
    expect(home!.priority).toBe(1)
    expect(home!.changeFrequency).toBe('weekly')
  })

  it('no incluye páginas privadas', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)

    expect(urls).not.toContain('https://psicopedagogia.cl/checkout')
    expect(urls).not.toContain('https://psicopedagogia.cl/carrito')
    expect(urls).not.toContain('https://psicopedagogia.cl/admin')
    expect(urls).not.toContain('https://psicopedagogia.cl/perfil')
  })
})

describe('SEO - Robots', () => {
  it('permite acceso a todas las páginas públicas', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const publicRule = rules.find((r: any) => r.userAgent === '*')

    expect(publicRule).toBeDefined()
    expect(publicRule!.allow).toBe('/')
  })

  it('bloquea páginas privadas', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const publicRule = rules.find((r: any) => r.userAgent === '*')

    expect(publicRule!.disallow).toContain('/admin/')
    expect(publicRule!.disallow).toContain('/checkout')
    expect(publicRule!.disallow).toContain('/carrito')
    expect(publicRule!.disallow).toContain('/perfil')
    expect(publicRule!.disallow).toContain('/mis-descargas')
  })

  it('incluye URL del sitemap', () => {
    const result = robots()

    expect(result.sitemap).toBe('https://psicopedagogia.cl/sitemap.xml')
  })
})

describe('SEO - Metadata de páginas', () => {
  it('home tiene título y descripción', async () => {
    const { metadata } = await import('@/app/page')

    expect(metadata).toBeDefined()
    expect(typeof metadata).toBe('object')
    const m = metadata as Record<string, unknown>
    expect(m.title).toBeTruthy()
    expect(m.description).toBeTruthy()
  })

  it('catálogo tiene metadata', async () => {
    const { metadata } = await import('@/app/catalogo/page')

    expect(metadata).toBeDefined()
    const m = metadata as Record<string, unknown>
    expect(m.title).toBeTruthy()
    expect(m.description).toBeTruthy()
  })

  it('material educativo tiene metadata', async () => {
    const { metadata } = await import('@/app/material-educativo/page')

    expect(metadata).toBeDefined()
    const m = metadata as Record<string, unknown>
    expect(m.title).toBeTruthy()
  })

  it('comunidad tiene metadata', async () => {
    const { metadata } = await import('@/app/comunidad/page')

    expect(metadata).toBeDefined()
    const m = metadata as Record<string, unknown>
    expect(m.title).toBeTruthy()
  })

  it('buscar tiene metadata', async () => {
    const { metadata } = await import('@/app/buscar/page')

    expect(metadata).toBeDefined()
    const m = metadata as Record<string, unknown>
    expect(m.title).toBeTruthy()
  })

  it('registro tiene metadata', async () => {
    const { metadata } = await import('@/app/registro/page')

    expect(metadata).toBeDefined()
    const m = metadata as Record<string, unknown>
    expect(m.title).toBeTruthy()
  })

  it('login tiene metadata', async () => {
    const { metadata } = await import('@/app/login/page')

    expect(metadata).toBeDefined()
    const m = metadata as Record<string, unknown>
    expect(m.title).toBeTruthy()
  })

  it('root layout tiene Open Graph configurado', async () => {
    const { metadata } = await import('@/app/layout')

    expect(metadata).toBeDefined()
    const m = metadata as Record<string, unknown>
    expect(m.openGraph).toBeDefined()
    const og = m.openGraph as Record<string, unknown>
    expect(og.type).toBe('website')
    expect(og.locale).toBe('es_CL')
    expect(og.siteName).toBe('Psicopedagogía Chile')
  })

  it('root layout tiene Twitter cards configurado', async () => {
    const { metadata } = await import('@/app/layout')

    const m = metadata as Record<string, unknown>
    expect(m.twitter).toBeDefined()
    const tw = m.twitter as Record<string, unknown>
    expect(tw.card).toBe('summary_large_image')
  })

  it('root layout tiene robots configurado', async () => {
    const { metadata } = await import('@/app/layout')

    const m = metadata as Record<string, unknown>
    expect(m.robots).toBeDefined()
    const robots = m.robots as Record<string, unknown>
    expect(robots.index).toBe(true)
    expect(robots.follow).toBe(true)
  })
})
