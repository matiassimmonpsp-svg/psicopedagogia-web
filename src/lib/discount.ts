/**
 * Validación centralizada de códigos de descuento.
 * Reutilizada por /api/discount-codes y /api/checkout.
 */

import { prisma } from './prisma'

export interface DiscountResult {
  valid: boolean
  discount?: number
  discountPercent?: number
  discountCodeId?: number
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

  if (!found || !found.isActive || (found.maxUses != null && found.usedCount >= found.maxUses) || (found.expiresAt && new Date(found.expiresAt) < new Date())) {
    return { valid: false, error: 'Código no válido' }
  }

  const discountPercent = found.discountPct
  if (discountPercent < 1 || discountPercent > 100) {
    return { valid: false, error: 'Configuración de descuento inválida' }
  }
  const discount = Math.round((cartTotal || 0) * discountPercent / 100)

  return {
    valid: true,
    discountCodeId: found.id,
    code: found.code,
    discount,
    discountPercent,
  }
}
