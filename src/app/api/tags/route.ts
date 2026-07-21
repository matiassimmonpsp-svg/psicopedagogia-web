import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json({ tags })
  } catch (err: unknown) {
    logger.error('Error al obtener tags', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener tags' }, { status: 500 })
  }
}
