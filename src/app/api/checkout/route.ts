import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    const csrf = csrfCheck(request)
    if (csrf) return csrf

    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const body = await request.json()
    console.log('CHECKOUT REQUEST - user:', user.id, 'items:', JSON.stringify(body.items))

    const { items: rawItems, paymentMethod } = body
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const items = rawItems as { id: string; priceClp: number }[]

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'Tu sesión ya no es válida. Cierra sesión y vuelve a iniciarla.' }, { status: 401 })
    }

    const ids = items.map(i => i.id)
    const existingResources = await prisma.resource.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    })
    const existingIds = new Set(existingResources.map(r => r.id))
    const missingIds = ids.filter(id => !existingIds.has(id))
    if (missingIds.length > 0) {
      return NextResponse.json({
        error: `Los siguientes recursos ya no existen: ${missingIds.join(', ')}. Limpia tu carrito e inténtalo de nuevo.`,
      }, { status: 400 })
    }

    const totalClp = items.reduce((s, i) => s + i.priceClp, 0)

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalClp,
        status: 'completed',
        paymentMethod: paymentMethod || 'simulated',
        items: {
          create: items.map(i => ({
            resourceId: i.id,
            priceClp: i.priceClp,
          })),
        },
      },
    })

    await prisma.order.deleteMany({
      where: { userId: user.id, status: 'cart' },
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err: any) {
    console.error('CHECKOUT ERROR:', err.code || err.message, err.meta ? JSON.stringify(err.meta) : '')
    return NextResponse.json({
      error: `Error al procesar el pago: ${err.message || 'desconocido'}`,
    }, { status: 500 })
  }
}
