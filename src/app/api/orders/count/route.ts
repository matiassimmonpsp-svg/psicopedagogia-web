import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const user = await requireSession()
    if (user instanceof NextResponse) return user

    const count = await prisma.order.count({
      where: { userId: user.id, status: 'completed' },
    })

    return NextResponse.json({ count })
  } catch (err: unknown) {
    logger.error('Error al contar pedidos', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al contar pedidos' }, { status: 500 })
  }
}
