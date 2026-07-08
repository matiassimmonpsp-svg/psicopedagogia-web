import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

export async function DELETE(request: NextRequest, { params }: { params: { resourceId: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const order = await prisma.order.findFirst({
    where: { userId: user.id, status: 'cart' },
  })

  if (!order) {
    return NextResponse.json({ error: 'Carrito vacío' }, { status: 404 })
  }

  await prisma.orderItem.deleteMany({
    where: { orderId: order.id, resourceId: params.resourceId },
  })

  const remaining = await prisma.orderItem.count({ where: { orderId: order.id } })

  if (remaining === 0) {
    await prisma.order.delete({ where: { id: order.id } })
  } else {
    const total = await prisma.orderItem.aggregate({
      where: { orderId: order.id },
      _sum: { priceClp: true },
    })
    await prisma.order.update({
      where: { id: order.id },
      data: { totalClp: total._sum.priceClp || 0 },
    })
  }

  return NextResponse.json({ success: true })
}
