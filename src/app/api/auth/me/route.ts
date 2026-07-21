import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const user = await requireSession()
    if (user instanceof NextResponse) return NextResponse.json({ user: null }, { status: 401 })
    return NextResponse.json({ user })
  } catch (err: unknown) {
    logger.error('Error al obtener sesión', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
