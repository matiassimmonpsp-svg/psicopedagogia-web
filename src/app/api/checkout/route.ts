import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'
import { validateDiscountCode } from '@/lib/discount'
import { logger } from '@/lib/logger'
import { enforceRateLimit, requireSession } from '@/lib/api-helpers'

const VALID_PAYMENT_METHODS = ['simulated', 'test', 'webpay', 'flow', 'transfer', 'card'] as const

async function validateCart(userId: string) {
  const cartOrder = await prisma.order.findFirst({
    where: { userId, status: 'cart' },
    include: { items: true },
  })
  if (!cartOrder || !cartOrder.items.length) {
    return { error: 'Carrito vacío', status: 400 as const }
  }

  const resourceIds = cartOrder.items.map(i => i.resourceId)
  const existentes = await prisma.resource.findMany({
    where: { id: { in: resourceIds } },
    select: { id: true, priceClp: true, isActive: true },
  })

  const faltantes = resourceIds.filter(id => !existentes.some(r => r.id === id))
  if (faltantes.length) {
    return { error: 'Algunos recursos de tu carrito ya no están disponibles. Límpialo e intenta de nuevo.', status: 400 as const }
  }

  const pausados = existentes.filter(r => r.isActive === false)
  if (pausados.length) {
    return { error: 'Algunos recursos de tu carrito no están disponibles temporalmente. Límpialo e intenta de nuevo.', status: 400 as const }
  }

  const yaPoseidos = await prisma.orderItem.findMany({
    where: { resourceId: { in: resourceIds }, order: { userId, status: 'completed' } },
    select: { resourceId: true },
  })
  if (yaPoseidos.length) {
    return { error: 'Ya posees algunos recursos de tu carrito. Límpialo e intenta de nuevo.', status: 400 as const }
  }

  return { resourceIds, existentes }
}

async function applyDiscount(
  discountCode: string | undefined,
  totalClp: number,
  userId: string,
) {
  if (!discountCode) return { totalClp, discountUsed: 0, discountCodeId: null as number | null }

  const result = await validateDiscountCode(discountCode, totalClp)
  if (!result.valid) {
    return { error: result.error, status: 400 as const }
  }

  const discountUsed = result.discount ?? 0
  return {
    totalClp: Math.max(0, totalClp - discountUsed),
    discountUsed,
    discountCodeId: result.discountCodeId ?? null,
  }
}

async function executeTransaction(
  userId: string,
  resourceIds: string[],
  priceMap: Map<string, number>,
  totalClp: number,
  safePaymentMethod: string,
  discountCodeId: number | null,
) {
  return prisma.$transaction(async (tx) => {
    if (discountCodeId) {
      const found = await tx.discountCode.findUnique({ where: { id: discountCodeId } })
      if (!found) throw new Error('Código de descuento no encontrado')
      if ((found.usedCount ?? 0) >= (found.maxUses ?? 999999)) {
        throw new Error('Código de descuento agotado')
      }

      const yaUsado = await tx.order.findFirst({
        where: { userId, discountCodeId, status: 'completed' },
      })
      if (yaUsado) throw new Error('Ya utilizaste este código de descuento')

      await tx.discountCode.update({
        where: { id: discountCodeId },
        data: { usedCount: { increment: 1 } },
      })
    }

    const created = await tx.order.create({
      data: {
        userId,
        totalClp,
        status: 'completed',
        paymentMethod: safePaymentMethod,
        discountCodeId,
        items: {
          create: resourceIds.map(id => ({ resourceId: id, priceClp: priceMap.get(id) ?? 0 })),
        },
      },
    })

    await tx.order.deleteMany({ where: { userId, status: 'cart' } })
    return created
  })
}

/** POST /api/checkout — Convierte el carrito en una orden pagada */
export async function POST(request: NextRequest) {
  try {
    const csrf = csrfCheck(request)
    if (csrf) return csrf

    const rateLimited = await enforceRateLimit(request, 'checkout', 10)
    if (rateLimited) return rateLimited

    const user = await requireSession()
    if (user instanceof NextResponse) return user

    const { paymentMethod, discountCode } = await request.json()

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Método de pago inválido' }, { status: 400 })
    }
    const safePaymentMethod = paymentMethod

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Sesión inválida. Vuelve a iniciar sesión.' }, { status: 401 })

    const cartValidation = await validateCart(user.id)
    if ('error' in cartValidation) {
      return NextResponse.json({ error: cartValidation.error }, { status: cartValidation.status })
    }

    const { resourceIds, existentes } = cartValidation
    const baseTotal = existentes.reduce((s, r) => s + (r.priceClp ?? 0), 0)

    const discountResult = await applyDiscount(discountCode, baseTotal, user.id)
    if ('error' in discountResult) {
      return NextResponse.json({ error: discountResult.error }, { status: discountResult.status })
    }

    const priceMap = new Map(existentes.map(r => [r.id, r.priceClp ?? 0]))
    const order = await executeTransaction(
      user.id, resourceIds, priceMap,
      discountResult.totalClp, safePaymentMethod, discountResult.discountCodeId,
    )

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err: unknown) {
    logger.error('Error en checkout', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}
