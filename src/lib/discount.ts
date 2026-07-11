/**
 * Validación centralizada de códigos de descuento.
 * Reutilizada por /api/discount-codes y /api/checkout.
 */

import { prisma } from './prisma'

export interface DiscountResult {
  valid: boolean
  discount?: number
  discountPercent?: number
  code?: string
  error?: string
}

/** Valida un código de descuento y calcula el descuento aplicable */
export async function validateDiscountCode(
  code: string,
  cartTotal: number
): Promise<DiscountResult> {
  if (!code) {
    return { valid: false, error: 'Ingresa un código' }
  }

  const found = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!found) {
    return { valid: false, error: 'Código no válido' }
  }

  if (!found.isActive) {
    return { valid: false, error: 'Este código ya no está activo' }
  }

  if (found.maxUses && found.usedCount >= found.maxUses) {
    return { valid: false, error: 'Este código ya alcanzó su límite de usos' }
  }

  if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
    return { valid: false, error: 'Este código ha expirado' }
  }

  const discountPercent = found.discountPct
  const discount = Math.round((cartTotal || 0) * discountPercent / 100)

  return {
    valid: true,
    code: found.code,
    discount,
    discountPercent,
  }
}
