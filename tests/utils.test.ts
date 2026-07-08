import { describe, it, expect } from 'vitest'
import { formatClp, hasActivePromo, normalizeText, expandSearchQuery, getPromoEndDate } from '@/lib/utils'

describe('formatClp', () => {
  it('formatea 0 como $0', () => {
    expect(formatClp(0)).toBe('$0')
  })

  it('formatea valores sin decimales', () => {
    expect(formatClp(5990)).toBe('$5.990')
  })

  it('formatea valores grandes', () => {
    expect(formatClp(15000)).toBe('$15.000')
  })

  it('redondea correctamente', () => {
    expect(formatClp(1499.7)).toBe('$1.500')
  })
})

describe('hasActivePromo', () => {
  it('retorna false si promoFreeUntil es null', () => {
    expect(hasActivePromo({})).toBe(false)
  })

  it('retorna false si promoFreeUntil está en el pasado', () => {
    expect(hasActivePromo({ promoFreeUntil: '2020-01-01' })).toBe(false)
  })

  it('retorna true si promoFreeUntil está en el futuro', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(hasActivePromo({ promoFreeUntil: future })).toBe(true)
  })

  it('retorna false si promoFreeUntil es justo ahora (no mayor)', () => {
    const now = new Date().toISOString()
    expect(hasActivePromo({ promoFreeUntil: now })).toBe(false)
  })
})

describe('normalizeText', () => {
  it('convierte a minúsculas', () => {
    expect(normalizeText('Hola Mundo')).toBe('hola mundo')
  })

  it('elimina tildes', () => {
    expect(normalizeText('atención evaluación')).toBe('atencion evaluacion')
  })

  it('elimina caracteres especiales', () => {
    expect(normalizeText('¿cómo estás? 100%').trim()).toBe('como estas 100')
  })
})

describe('expandSearchQuery', () => {
  it('divide en tokens', () => {
    expect(expandSearchQuery('conciencia fonológica')).toEqual(['conciencia', 'fonologica'])
  })

  it('retorna array vacío para string vacío', () => {
    expect(expandSearchQuery('')).toEqual([])
  })

  it('normaliza cada token', () => {
    expect(expandSearchQuery('Comprensión Lectora')).toEqual(['comprension', 'lectora'])
  })
})

describe('getPromoEndDate', () => {
  it('retorna null si no hay promo', () => {
    expect(getPromoEndDate(null)).toBeNull()
  })

  it('retorna fecha si es futura', () => {
    const future = new Date(Date.now() + 86400000)
    const result = getPromoEndDate(future.toISOString())
    expect(result).toBeInstanceOf(Date)
    expect(result!.getTime()).toBeGreaterThan(Date.now())
  })

  it('retorna null si la promo expiró', () => {
    expect(getPromoEndDate('2020-01-01')).toBeNull()
  })
})
