import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdminWithCsrf, enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

/** GET /api/discount-codes/[id] — Obtiene un código por ID */
export async function GET(request: Request, { params: p }: { params: { id: string } }) {
  const params = await p
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const code = await prisma.discountCode.findUnique({ where: { id } })
    if (!code) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    return NextResponse.json({ code })
  } catch (err: unknown) {
    logger.error('Error al obtener código de descuento', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener código' }, { status: 500 })
  }
}

/** PUT /api/discount-codes/[id] — Actualiza un código */
export async function PUT(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'discount-put', 20)
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    const pct = body.discountPercent ?? body.discountPct
    if (pct !== undefined) {
      const parsedPct = parseInt(pct)
      if (isNaN(parsedPct) || parsedPct < 1 || parsedPct > 100) {
        return NextResponse.json({ error: 'El porcentaje debe ser entre 1 y 100' }, { status: 400 })
      }
      data.discountPct = parsedPct
    }
    if (body.maxUses !== undefined) data.maxUses = body.maxUses ? parseInt(body.maxUses) : null
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (body.isActive !== undefined) data.isActive = body.isActive

    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const code = await prisma.discountCode.update({ where: { id }, data })
    return NextResponse.json({ code })
  } catch (err: unknown) {
    logger.error('Error al actualizar código de descuento', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al actualizar código' }, { status: 500 })
  }
}

/** DELETE /api/discount-codes/[id] — Elimina un código */
export async function DELETE(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const authError = await requireAdminWithCsrf(request)
  if (authError) return authError

  const rateLimited = await enforceRateLimit(request, 'discount-delete', 10)
  if (rateLimited) return rateLimited

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    await prisma.discountCode.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    logger.error('Error al eliminar código de descuento', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al eliminar código' }, { status: 500 })
  }
}
