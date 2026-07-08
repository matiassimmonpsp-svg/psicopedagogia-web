import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

/** GET /api/cart — Obtiene los items del carrito del usuario */
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ items: [] })

  const order = await prisma.order.findFirst({
    where: { userId: user.id, status: 'cart' },
    include: { items: { include: { resource: { select: { title: true, course: { select: { name: true } } } } } } },
  })

  const items = order?.items.map(i => ({
    id: i.resourceId,
    title: i.resource.title,
    priceClp: i.priceClp,
    courseName: i.resource.course?.name || null,
  })) || []

  return NextResponse.json({ items })
}

/** POST /api/cart — Agrega un recurso al carrito */
export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { resourceId, priceClp } = await request.json()
  if (!resourceId || !priceClp) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  /* Busca o crea una orden en estado 'cart' */
  let order = await prisma.order.findFirst({ where: { userId: user.id, status: 'cart' } })
  if (!order) {
    order = await prisma.order.create({
      data: { userId: user.id, totalClp: 0, status: 'cart' },
    })
  }

  /* Evita duplicados */
  const existe = await prisma.orderItem.findFirst({
    where: { orderId: order.id, resourceId },
  })
  if (existe) return NextResponse.json({ message: 'Ya está en el carrito' })

  await prisma.orderItem.create({
    data: { orderId: order.id, resourceId, priceClp },
  })

  /* Actualiza el total */
  const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })
  const total = items.reduce((s, i) => s + i.priceClp, 0)
  await prisma.order.update({ where: { id: order.id }, data: { totalClp: total } })

  return NextResponse.json({ success: true })
}
