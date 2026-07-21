import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * GET /api/health — Health check endpoint.
 * Verifica conectividad con la base de datos.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ status: 'ok' })
    }
    return NextResponse.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch (error: unknown) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : error })
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ status: 'error' }, { status: 503 })
    }
    return NextResponse.json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() }, { status: 503 })
  }
}
