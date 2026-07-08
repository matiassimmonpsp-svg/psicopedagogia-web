import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const count = await prisma.order.count({
    where: { userId: user.id, status: 'completed' },
  })

  return NextResponse.json({ count })
}
