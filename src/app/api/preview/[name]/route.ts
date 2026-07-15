import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
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
export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit(`preview:${ip}`, 60, 60_000)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

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
}
