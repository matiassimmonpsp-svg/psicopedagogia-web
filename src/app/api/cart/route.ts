import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'
import { enforceRateLimit, requireSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** GET /api/cart — Obtiene los items del carrito del usuario */
export async function GET() {
  try {
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
  } catch (err: unknown) {
    logger.error('Error al obtener carrito', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener carrito' }, { status: 500 })
  }
}

/** POST /api/cart — Agrega un recurso al carrito */
export async function POST(request: NextRequest) {
  try {
    const csrf = csrfCheck(request)
    if (csrf) return csrf

    const rateLimited = await enforceRateLimit(request, 'cart', 30)
    if (rateLimited) return rateLimited

    const user = await requireSession()
    if (user instanceof NextResponse) return user

    const { resourceId } = await request.json()
    if (typeof resourceId !== 'string' || !resourceId.trim()) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    /* Obtener precio y estado del recurso en una sola query (no confiar en el cliente) */
    const recursoData = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { priceClp: true, isFree: true, isActive: true },
    })
    if (!recursoData) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }
    const priceClp = recursoData.isFree ? 0 : (recursoData.priceClp ?? 0)

    if (!recursoData.isActive) {
      return NextResponse.json({ error: 'Este recurso no está disponible temporalmente' }, { status: 400 })
    }

    /* Verificar si el usuario ya posee este recurso */
    const yaPosee = await prisma.orderItem.findFirst({
      where: { resourceId, order: { userId: user.id, status: 'completed' } },
    })
    if (yaPosee) {
      return NextResponse.json({ error: 'Ya posees este recurso' }, { status: 400 })
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
    if (existe) return NextResponse.json({ success: true })

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.create({
        data: { orderId: order.id, resourceId, priceClp },
      })
      await tx.order.update({ where: { id: order.id }, data: { totalClp: { increment: priceClp } } })
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al agregar al carrito', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al agregar al carrito' }, { status: 500 })
  }
}
