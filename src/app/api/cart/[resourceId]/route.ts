import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'
import { enforceRateLimit, requireSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** DELETE /api/cart/[resourceId] — Elimina un recurso del carrito */
export async function DELETE(_request: NextRequest, { params: p }: { params: { resourceId: string } }) {
  const params = await p
  try {
    const csrf = csrfCheck(_request)
    if (csrf) return csrf

    const rateLimited = await enforceRateLimit(_request, 'cart-delete', 20)
    if (rateLimited) return rateLimited

    const user = await requireSession()
    if (user instanceof NextResponse) return user

    const order = await prisma.order.findFirst({ where: { userId: user.id, status: 'cart' } })
    if (!order) return NextResponse.json({ success: true })

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { orderId: order.id, resourceId: params.resourceId },
      })

      const result = await tx.orderItem.aggregate({
        where: { orderId: order.id },
        _sum: { priceClp: true },
      })
      const total = result._sum.priceClp ?? 0
      await tx.order.update({ where: { id: order.id }, data: { totalClp: total } })
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al eliminar del carrito', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al eliminar del carrito' }, { status: 500 })
  }
}
