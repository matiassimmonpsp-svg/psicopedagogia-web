import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import fs from 'fs'
import path from 'path'

const ALLOWED_DIRS = [
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'private'),
].map(d => path.resolve(d))

function safeResolve(fileField: string): string | null {
  if (fileField.includes('..')) return null

  const candidates = [
    path.join(process.cwd(), 'public', fileField),
    path.join(process.cwd(), 'private', fileField),
  ]

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    const isAllowed = ALLOWED_DIRS.some(dir => resolved.startsWith(dir + path.sep) || resolved === dir)
    if (!isAllowed) continue
    if (!fs.existsSync(resolved)) continue
    return resolved
  }

  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
  const rateKey = `download:${ip}:${type || 'pdf'}`
  const { allowed } = checkRateLimit(rateKey, 20, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiadas descargas. Intenta de nuevo en 1 minuto' }, { status: 429 })
  }

  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para descargar' }, { status: 401 })
    }

    const resource = await prisma.resource.findUnique({ where: { id: params.id } })
    if (!resource) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    const promoActive = !!(resource.promoFreeUntil && new Date(resource.promoFreeUntil) > new Date())
    const isFreeNow = resource.isFree || promoActive

    const hasPaid = await prisma.orderItem.findFirst({
      where: { resourceId: resource.id, order: { userId: user.id, status: 'completed' } },
    })

    if (!isFreeNow && !hasPaid) {
      return NextResponse.json({ error: 'Debes comprar este recurso para descargarlo' }, { status: 403 })
    }

    if (hasPaid) {
      // purchased → unlimited
    } else if (promoActive) {
      // time-limited free promo → 1 download max
      const existingDownload = await prisma.download.findFirst({
        where: { userId: user.id, resourceId: resource.id },
      })
      if (existingDownload) {
        return NextResponse.json({ error: 'Ya descargaste este recurso durante el período gratuito. Cómpralo para descargas ilimitadas.' }, { status: 403 })
      }
    }
    // permanently free → unlimited

    const fileField = type === 'editable' ? resource.editablePath : resource.filePath
    if (!fileField) {
      return NextResponse.json({ error: 'Archivo no disponible' }, { status: 404 })
    }

    const filepath = safeResolve(fileField)
    if (!filepath) {
      return NextResponse.json({ error: 'Archivo no encontrado en el servidor' }, { status: 404 })
    }

    if (type !== 'editable') {
      await prisma.download.create({
        data: { userId: user.id, resourceId: resource.id, ipAddress: ip },
      }).catch(() => {})
      await prisma.resource.update({
        where: { id: resource.id },
        data: { downloadsCount: { increment: 1 } },
      }).catch(() => {})
    }

    const ext = path.extname(filepath).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'
    const safeName = resource.title.replace(/[^a-z0-9]+/gi, '-')
    const fileBuffer = fs.readFileSync(filepath)
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}${ext}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al descargar' }, { status: 500 })
  }
}
