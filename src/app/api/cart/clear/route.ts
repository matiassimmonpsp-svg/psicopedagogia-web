import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'
import { NextRequest } from 'next/server'

/** DELETE /api/cart/clear — Vacía todo el carrito del usuario en una sola operación */
export async function DELETE(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const order = await prisma.order.findFirst({ where: { userId: user.id, status: 'cart' } })
  if (!order) return NextResponse.json({ success: true })

  await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
  await prisma.order.update({ where: { id: order.id }, data: { totalClp: 0 } })

  return NextResponse.json({ success: true })
}
