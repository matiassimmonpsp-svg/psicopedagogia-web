import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, downloads: true } },
    },
  })

  return NextResponse.json({ users })
}
