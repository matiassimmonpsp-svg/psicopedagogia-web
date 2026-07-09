import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

/** GET /api/discount-codes/[id] — Obtiene un código por ID */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const code = await prisma.discountCode.findUnique({ where: { id: parseInt(params.id) } })
  if (!code) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ code })
}

/** PUT /api/discount-codes/[id] — Actualiza un código */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const data: any = {}
    const pct = body.discountPercent ?? body.discountPct
    if (pct !== undefined) data.discountPct = parseInt(pct)
    if (body.maxUses !== undefined) data.maxUses = body.maxUses ? parseInt(body.maxUses) : null
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (body.isActive !== undefined) data.isActive = body.isActive

    const code = await prisma.discountCode.update({ where: { id: parseInt(params.id) }, data })
    return NextResponse.json({ code })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error al actualizar código' }, { status: 500 })
  }
}

/** DELETE /api/discount-codes/[id] — Elimina un código */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.discountCode.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error al eliminar código' }, { status: 500 })
  }
}
