import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ items: [] })
  }

  const order = await prisma.order.findFirst({
    where: { userId: user.id, status: 'cart' },
    include: {
      items: {
        include: { resource: { select: { id: true, title: true, course: { select: { name: true } } } } },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ items: [] })
  }

  const items = order.items.map(i => ({
    id: i.resourceId,
    title: i.resource.title,
    priceClp: i.priceClp,
    courseName: i.resource.course?.name || '',
  }))

  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
  }

  const { resourceId, priceClp, title, courseName } = await request.json()
  if (!resourceId || priceClp == null) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  let order = await prisma.order.findFirst({
    where: { userId: user.id, status: 'cart' },
  })

  if (!order) {
    order = await prisma.order.create({
      data: { userId: user.id, totalClp: 0, status: 'cart' },
    })
  }

  const existing = await prisma.orderItem.findFirst({
    where: { orderId: order.id, resourceId },
  })

  if (!existing) {
    await prisma.orderItem.create({
      data: { orderId: order.id, resourceId, priceClp: Number(priceClp) },
    })
  }

  const total = await prisma.orderItem.aggregate({
    where: { orderId: order.id },
    _sum: { priceClp: true },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { totalClp: total._sum.priceClp || 0 },
  })

  return NextResponse.json({ success: true })
}
