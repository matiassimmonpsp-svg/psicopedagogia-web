import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

/** DELETE /api/cart/[resourceId] — Elimina un recurso del carrito */
export async function DELETE(_request: NextRequest, { params }: { params: { resourceId: string } }) {
  const csrf = csrfCheck(_request)
  if (csrf) return csrf

  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const order = await prisma.order.findFirst({ where: { userId: user.id, status: 'cart' } })
  if (!order) return NextResponse.json({ error: 'Carrito vacío' }, { status: 404 })

  await prisma.orderItem.deleteMany({
    where: { orderId: order.id, resourceId: params.resourceId },
  })

  /* Recalcula el total */
  const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })
  const total = items.reduce((s, i) => s + i.priceClp, 0)
  await prisma.order.update({ where: { id: order.id }, data: { totalClp: total } })

  return NextResponse.json({ success: true })
}
