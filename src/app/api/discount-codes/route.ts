import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'
import { validateDiscountCode } from '@/lib/discount'

/** GET /api/discount-codes — Lista todos los códigos de descuento */
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ codes })
}

/** POST /api/discount-codes — Crea o verifica un código de descuento */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    /* Verificar código (público) */
    if (body.action === 'verify') {
      const result = await validateDiscountCode(body.code, body.cartTotal)
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({
        code: result.code,
        discount: result.discount,
        discountPercent: result.discountPercent,
      })
    }

    /* Crear código (solo admin) */
    const csrf = csrfCheck(request)
    if (csrf) return csrf
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { code, discountPercent, discountPct, maxUses, expiresAt } = body
    const pct = discountPercent ?? discountPct

    if (!code || !pct) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const existente = await prisma.discountCode.findUnique({ where: { code } })
    if (existente) return NextResponse.json({ error: 'El código ya existe' }, { status: 409 })

    const nuevo = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        discountPct: parseInt(pct),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ code: nuevo }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error al crear código' }, { status: 500 })
  }
}
