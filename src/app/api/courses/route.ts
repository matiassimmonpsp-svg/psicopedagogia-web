import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const msg = err instanceof Error ? err.message : 'Error al obtener datos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
