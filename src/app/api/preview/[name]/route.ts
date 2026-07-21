import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { promises as fs } from 'fs'
import path from 'path'

const DIRS_BUSQUEDA = [
  path.resolve(process.cwd(), 'private', 'uploads', 'previews'),
  path.resolve(process.cwd(), 'public', 'uploads', 'previews'),
]

const MIME_IMG: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

/** GET /api/preview/[name] — Sirve imágenes de preview con rate limit y protección path traversal */
export async function GET(request: NextRequest, { params: p }: { params: { name: string } }) {
  const params = await p
  try {
    const rateLimited = await enforceRateLimit(request, 'preview', 60)
    if (rateLimited) return rateLimited

    const { name } = params
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
    }

    for (const dir of DIRS_BUSQUEDA) {
      const ruta = path.resolve(dir, name)
      if (!ruta.startsWith(dir + path.sep)) continue
      try {
        const buffer = await fs.readFile(ruta)
        const ext = path.extname(ruta).toLowerCase()
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': MIME_IMG[ext] || 'application/octet-stream',
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        })
      } catch {
        continue
      }
    }

    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  } catch (err: unknown) {
    logger.error('Error en preview', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
