import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateDiscountCode } from '@/lib/discount'
import { requireAdminWithCsrf, enforceRateLimit, requireAdminSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** GET /api/discount-codes — Lista todos los códigos de descuento */
export async function GET() {
  try {
    const admin = await requireAdminSession()
    if (admin instanceof NextResponse) return admin

    const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ codes })
  } catch (err: unknown) {
    logger.error('Error al obtener códigos de descuento', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener códigos' }, { status: 500 })
  }
}

/** POST /api/discount-codes — Crea o verifica un código de descuento */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    /* Verificar código (público) — rate limit para evitar brute-force */
    if (body.action === 'verify') {
      const rateLimited = await enforceRateLimit(request, 'discount-verify', 10)
      if (rateLimited) return rateLimited

      const result = await validateDiscountCode(body.code, body.cartTotal)
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({
        valid: true,
        discount: result.discount,
      })
    }

    /* Crear código (solo admin) */
    const authError = await requireAdminWithCsrf(request)
    if (authError) return authError

    const rateLimited = await enforceRateLimit(request, 'discount-create', 20)
    if (rateLimited) return rateLimited

    const { code, discountPercent, discountPct, maxUses, expiresAt } = body
    const pct = discountPercent ?? discountPct

    if (!code || !pct) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const parsedPct = parseInt(pct)
    if (isNaN(parsedPct) || parsedPct < 1 || parsedPct > 100) {
      return NextResponse.json({ error: 'El porcentaje debe ser entre 1 y 100' }, { status: 400 })
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
    logger.error('Error al crear código de descuento', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al crear código' }, { status: 500 })
  }
}
