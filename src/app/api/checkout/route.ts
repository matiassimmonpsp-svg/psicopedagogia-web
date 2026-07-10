import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

/** POST /api/checkout — Convierte el carrito en una orden pagada */
export async function POST(request: NextRequest) {
  try {
    const csrf = csrfCheck(request)
    if (csrf) return csrf

    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const { items: rawItems, paymentMethod, discountCode } = await request.json()
    if (!rawItems?.length) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const items = rawItems as { id: string }[]

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'Sesión inválida. Vuelve a iniciar sesión.' }, { status: 401 })
    }

    const ids = items.map(i => i.id)
    const existentes = await prisma.resource.findMany({ where: { id: { in: ids } }, select: { id: true, priceClp: true } })
    const faltantes = ids.filter(id => !existentes.some(r => r.id === id))
    if (faltantes.length) {
      return NextResponse.json({
        error: `Recursos ya no disponibles: ${faltantes.join(', ')}. Limpia tu carrito.`,
      }, { status: 400 })
    }

    /* Calcular total desde la BD (evita manipulación del precio desde el cliente) */
    let totalClp = existentes.reduce((s, r) => s + (r.priceClp ?? 0), 0)

    /* Validar código de descuento si se envió */
    let discountUsed = 0
    if (discountCode) {
      const found = await prisma.discountCode.findUnique({ where: { code: discountCode.toUpperCase() } })
      if (!found || !found.isActive) {
        return NextResponse.json({ error: 'Código de descuento no válido' }, { status: 400 })
      }
      if (found.maxUses && found.usedCount >= found.maxUses) {
        return NextResponse.json({ error: 'Código de descuento agotado' }, { status: 400 })
      }
      if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Código de descuento expirado' }, { status: 400 })
      }
      discountUsed = Math.round(totalClp * found.discountPct / 100)
      totalClp = Math.max(0, totalClp - discountUsed)

      /* Incremento atómico: previene race condition entre checkouts concurrentes */
      const updated = await prisma.discountCode.updateMany({
        where: { id: found.id, usedCount: { lt: found.maxUses ?? 999999 } },
        data: { usedCount: { increment: 1 } },
      })
      if (updated.count === 0) {
        return NextResponse.json({ error: 'Código de descuento agotado' }, { status: 400 })
      }
    }

    /* Usar precios de la BD, no del cliente */
    const priceMap = new Map(existentes.map(r => [r.id, r.priceClp ?? 0]))

    const order = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId: user.id,
          totalClp,
          status: 'completed',
          paymentMethod: paymentMethod || 'simulated',
          items: {
            create: ids.map(id => ({ resourceId: id, priceClp: priceMap.get(id) ?? 0 })),
          },
        },
      }),
      prisma.order.deleteMany({ where: { userId: user.id, status: 'cart' } }),
    ])

    return NextResponse.json({ success: true, orderId: order[0].id })
  } catch (err: unknown) {
    console.error('Error en checkout:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}
