import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/** GET /api/courses — Devuelve cursos, áreas y subáreas de la base de datos */
export async function GET() {
  try {
    const [courses, areas, subareas] = await Promise.all([
      prisma.course.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.area.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.subarea.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    ])

    return NextResponse.json({ courses, areas, subareas })
  } catch (err: unknown) {
    logger.error('Error al obtener cursos', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}
