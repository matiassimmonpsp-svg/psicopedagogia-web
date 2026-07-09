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

    const items = rawItems as { id: string; priceClp: number }[]

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

      await prisma.discountCode.update({
        where: { id: found.id },
        data: { usedCount: { increment: 1 } },
      })
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalClp,
        status: 'completed',
        paymentMethod: paymentMethod || 'simulated',
        items: {
          create: items.map(i => ({ resourceId: i.id, priceClp: i.priceClp })),
        },
      },
    })

    await prisma.order.deleteMany({ where: { userId: user.id, status: 'cart' } })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err: unknown) {
    console.error('Error en checkout:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}
