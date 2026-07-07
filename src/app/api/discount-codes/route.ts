import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ codes })
  } catch {
    return NextResponse.json({ error: 'Error al obtener códigos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'verify') {
      const { code, cartTotal } = body
      if (!code) {
        return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
      }

      const discount = await prisma.discountCode.findUnique({ where: { code: code.toUpperCase() } })
      if (!discount) {
        return NextResponse.json({ error: 'Código no válido' }, { status: 404 })
      }
      if (!discount.isActive) {
        return NextResponse.json({ error: 'Este código ya no está activo' }, { status: 400 })
      }
      if (discount.maxUses && discount.usedCount >= discount.maxUses) {
        return NextResponse.json({ error: 'Este código ha alcanzado su límite de usos' }, { status: 400 })
      }
      if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Este código ha expirado' }, { status: 400 })
      }

      const discountAmount = cartTotal ? Math.round(cartTotal * discount.discountPercent / 100) : 0

      return NextResponse.json({
        valid: true,
        discount: discountAmount,
        discountPercent: discount.discountPercent,
        code: discount.code,
      })
    }

    const user = await getSession()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { code, discountPercent, maxUses, expiresAt } = body
    if (!code || discountPercent == null) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const created = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        discountPercent: Number(discountPercent),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ code: created }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'El código ya existe' }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
