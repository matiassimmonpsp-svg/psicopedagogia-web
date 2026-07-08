import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const purchases = await prisma.orderItem.findMany({
    where: { order: { userId: user.id, status: 'completed' } },
    include: {
      resource: {
        select: { id: true, title: true, isFree: true, course: { select: { name: true } } },
      },
      order: { select: { createdAt: true } },
    },
    orderBy: { order: { createdAt: 'desc' } },
  })

  const downloads = await prisma.download.findMany({
    where: { userId: user.id, resource: { isFree: true } },
    include: {
      resource: {
        select: { id: true, title: true, isFree: true, course: { select: { name: true } } },
      },
    },
    orderBy: { downloadedAt: 'desc' },
  })

  const purchased = purchases.map(p => ({
    id: `purchased-${p.id}`,
    resourceId: p.resource.id,
    title: p.resource.title,
    courseName: p.resource.course?.name || null,
    date: p.order.createdAt.toISOString(),
    type: 'purchased' as const,
  }))

  const free = downloads.map(d => ({
    id: `free-${d.id}`,
    resourceId: d.resource.id,
    title: d.resource.title,
    courseName: d.resource.course?.name || null,
    date: d.downloadedAt.toISOString(),
    type: 'free' as const,
  }))

  const seen = new Set<string>()
  const all = [...purchased, ...free].filter(item => {
    if (seen.has(item.resourceId)) return false
    seen.add(item.resourceId)
    return true
  })

  return NextResponse.json({ downloads: all })
}
