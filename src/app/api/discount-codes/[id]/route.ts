import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfCheck } from '@/lib/csrf'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { code, discountPercent, maxUses, expiresAt, isActive } = body

    const data: any = {}
    if (code) data.code = code.toUpperCase()
    if (discountPercent != null) data.discountPercent = Number(discountPercent)
    if (maxUses !== undefined) data.maxUses = maxUses ? Number(maxUses) : null
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null
    if (isActive !== undefined) data.isActive = isActive

    const updated = await prisma.discountCode.update({
      where: { id: Number(params.id) },
      data,
    })

    return NextResponse.json({ code: updated })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar código' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf

  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    await prisma.discountCode.delete({ where: { id: Number(params.id) } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar código' }, { status: 500 })
  }
}
