import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import fs from 'fs'
import path from 'path'

const SEARCH_DIRS = [
  path.resolve(process.cwd(), 'private', 'uploads', 'previews'),
  path.resolve(process.cwd(), 'public', 'uploads', 'previews'),
]

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
  const { allowed } = checkRateLimit(`preview:${ip}`, 60, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  const { name } = params
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }

  for (const dir of SEARCH_DIRS) {
    const filepath = path.resolve(dir, name)
    if (!filepath.startsWith(dir + path.sep)) continue
    if (fs.existsSync(filepath)) {
      const ext = path.extname(filepath).toLowerCase()
      const mimeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
      }
      const contentType = mimeMap[ext] || 'application/octet-stream'
      const fileBuffer = fs.readFileSync(filepath)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, immutable',
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    }
  }

  return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
}
