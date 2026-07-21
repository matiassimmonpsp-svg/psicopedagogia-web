import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'r1', title: 'Evaluación de lectoescritura 1°', description: 'Instrumento para evaluar lectoescritura en primer básico',
          resourceType: 'evaluation', isFree: true, priceClp: null, isActive: true,
          courseId: 3, areaId: 1, subareaId: 1, downloadsCount: 10,
          course: { name: '1° Básico', slug: '1-basico' },
          area: { name: 'Lectoescritura', slug: 'lectoescritura' },
          subarea: { name: 'Conciencia Fonológica', slug: 'conciencia-fonologica' },
          tags: [], previewPath: null, promoFreeUntil: null,
          createdAt: new Date(), updatedAt: new Date(),
        },
        {
          id: 'r2', title: 'Matemáticas 2° Básico', description: 'Evaluación de pensamiento lógico matemático',
          resourceType: 'evaluation', isFree: false, priceClp: 15000, isActive: true,
          courseId: 4, areaId: 2, subareaId: 10, downloadsCount: 5,
          course: { name: '2° Básico', slug: '2-basico' },
          area: { name: 'Pensamiento Lógico Matemático', slug: 'pensamiento-logico-matematico' },
          subarea: { name: 'Numeración y Conteo', slug: 'numeracion-conteo' },
          tags: [], previewPath: null, promoFreeUntil: null,
          createdAt: new Date(), updatedAt: new Date(),
        },
        {
          id: 'r3', title: 'Material educativo prekínder', description: 'Fichas de trabajo para prekínder',
          resourceType: 'educational', isFree: true, priceClp: null, isActive: true,
          courseId: 1, areaId: 3, subareaId: 17, downloadsCount: 20,
          course: { name: 'Prekínder', slug: 'prekinder' },
          area: { name: 'Habilidades Cognitivas', slug: 'habilidades-cognitivas' },
          subarea: { name: 'Atención', slug: 'atencion' },
          tags: [], previewPath: null, promoFreeUntil: null,
          createdAt: new Date(), updatedAt: new Date(),
        },
      ]),
      count: vi.fn().mockResolvedValue(3),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    orderItem: { findMany: vi.fn().mockResolvedValue([]) },
    course: { findMany: vi.fn().mockResolvedValue([]) },
    area: { findMany: vi.fn().mockResolvedValue([]) },
    subarea: { findMany: vi.fn().mockResolvedValue([]) },
    order: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({ id: 'c1', userId: 'u1', resourceId: 'r1', quantity: 1 }),
      deleteMany: vi.fn(),
    },
    download: { findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn((fns: any[]) => Promise.all(fns)),
    $queryRawUnsafe: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 10 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  hashIp: vi.fn().mockReturnValue('hashed-ip'),
}))

vi.mock('@/lib/csrf', () => ({
  csrfCheck: vi.fn().mockReturnValue(null),
  generateCsrfToken: vi.fn().mockReturnValue('fake-csrf'),
  getCsrfToken: vi.fn().mockReturnValue('fake-csrf'),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue(undefined),
    delete: vi.fn(),
  }),
}))

import { GET as catalogGET } from '@/app/api/catalog/route'
import { GET as searchGET } from '@/app/api/search/route'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as cartPOST } from '@/app/api/cart/route'
import { prisma } from '@/lib/prisma'
import * as auth from '@/lib/auth'

function makeCatalogRequest(urlParams?: Record<string, string>) {
  const qs = new URLSearchParams(urlParams || {})
  return {
    method: 'GET',
    url: `http://localhost:3001/api/catalog${qs.toString() ? '?' + qs.toString() : ''}`,
    headers: new Map(),
    nextUrl: new URL(`http://localhost:3001/api/catalog`),
    cookies: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  } as any
}

function makeSearchRequest(urlParams?: Record<string, string>) {
  const qs = new URLSearchParams(urlParams || {})
  return {
    method: 'GET',
    url: `http://localhost:3001/api/search${qs.toString() ? '?' + qs.toString() : ''}`,
    headers: new Map(),
    nextUrl: new URL(`http://localhost:3001/api/search`),
    cookies: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  } as any
}

function makeJsonRequest(body: Record<string, unknown>, method = 'POST') {
  return {
    json: () => Promise.resolve(body),
    method,
    headers: new Map(Object.entries({
      'x-forwarded-for': '127.0.0.1',
      'content-type': 'application/json',
    })),
    nextUrl: new URL('http://localhost:3001/api/auth/register'),
    cookies: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  } as any
}

describe('Flujo de usuario - Catálogo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna recursos activos', async () => {
    const req = makeCatalogRequest()
    const res = await catalogGET(req)
    const data = await res.json()

    expect(data.resources).toBeDefined()
    expect(data.resources.length).toBeGreaterThan(0)
    expect(data.resources.every((r: any) => r.isActive === true)).toBe(true)
  })

  it('no incluye filePath en recursos de BD', async () => {
    const req = makeCatalogRequest()
    const res = await catalogGET(req)
    const data = await res.json()

    const dbResources = data.resources.filter((r: any) => r.source === 'db')
    dbResources.forEach((r: any) => {
      expect(r.filePath).toBeUndefined()
    })
  })
})

describe('Flujo de usuario - Búsqueda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna resultados vacíos para parámetros vacíos', async () => {
    const req = makeSearchRequest()
    const res = await searchGET(req)
    const data = await res.json()

    expect(data.results).toBeDefined()
    expect(data.results).toEqual([])
  })

  it('retorna resultados y sugerencias cuando hay query', async () => {
    vi.mocked(prisma.$queryRawUnsafe).mockResolvedValueOnce([
      {
        id: 'r1', title: 'Evaluación', description: 'Test', preview_path: null,
        resource_type: 'evaluation', is_free: true, price_clp: null, promo_free_until: null,
        course_id: 3, area_id: 1, subarea_id: 1, downloads_count: 10, is_active: true,
        course_name: '1° Básico', course_slug: '1-basico',
        area_name: 'Lectoescritura', area_slug: 'lectoescritura',
        subarea_name: 'Conciencia', subarea_slug: 'conciencia',
        tags: '',
      },
    ])
    vi.mocked(prisma.$queryRawUnsafe).mockResolvedValueOnce([])

    const req = makeSearchRequest({ q: 'lectoescritura' })
    const res = await searchGET(req)
    const data = await res.json()

    expect(data.results).toBeDefined()
    expect(Array.isArray(data.results)).toBe(true)
    expect(data.suggestions).toBeDefined()
  })
})

describe('Flujo de usuario - Registro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registro exitoso crea usuario', async () => {
    const mockUser = { id: 'u1', email: 'nuevo@test.com', name: 'Nuevo', role: 'user' }
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.user.create).mockResolvedValueOnce({ ...mockUser, passwordHash: 'hash' } as any)
    vi.spyOn(auth, 'hashPassword').mockResolvedValue('hashed-pw')

    const req = makeJsonRequest({
      email: 'nuevo@test.com',
      password: 'Test1234',
      name: 'Nuevo',
    })
    const res = await registerPOST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe('nuevo@test.com')
  })

  it('registro con email existente falla', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 'existing', email: 'exist@test.com' } as any)

    const req = makeJsonRequest({
      email: 'exist@test.com',
      password: 'Test1234',
      name: 'Existente',
    })
    const res = await registerPOST(req)
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error).toBeTruthy()
  })
})

describe('Flujo de usuario - Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login exitoso retorna usuario', async () => {
    const mockUser = { id: 'u1', email: 'test@test.com', name: 'Test', role: 'user' }
    vi.spyOn(auth, 'authenticateUser').mockResolvedValue(mockUser as any)
    vi.spyOn(auth, 'signToken').mockResolvedValue('jwt-token' as any)

    const req = makeJsonRequest({ email: 'test@test.com', password: 'Test1234' })
    const res = await loginPOST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.user).toBeDefined()
  })

  it('login con credenciales incorrectas falla', async () => {
    vi.spyOn(auth, 'authenticateUser').mockRejectedValue(new Error('Correo o contraseña incorrectos'))

    const req = makeJsonRequest({ email: 'test@test.com', password: 'Wrong1234' })
    const res = await loginPOST(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBeTruthy()
  })
})

describe('Flujo de usuario - Carrito', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requiere autenticación', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValue(null)

    const req = makeJsonRequest({ resourceId: 'r1' }, 'POST')
    const res = await cartPOST(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBeTruthy()
  })
})
