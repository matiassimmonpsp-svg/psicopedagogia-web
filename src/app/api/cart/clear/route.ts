import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'
import { enforceRateLimit, requireSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** DELETE /api/cart/clear — Vacía todo el carrito del usuario en una sola operación */
export async function DELETE(request: NextRequest) {
  try {
    const csrf = csrfCheck(request)
    if (csrf) return csrf

    const rateLimited = await enforceRateLimit(request, 'cart-clear', 10)
    if (rateLimited) return rateLimited

    const user = await requireSession()
    if (user instanceof NextResponse) return user

    const order = await prisma.order.findFirst({ where: { userId: user.id, status: 'cart' } })
    if (!order) return NextResponse.json({ success: true })

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: order.id } })
      await tx.order.update({ where: { id: order.id }, data: { totalClp: 0 } })
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al vaciar carrito', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al vaciar carrito' }, { status: 500 })
  }
}
