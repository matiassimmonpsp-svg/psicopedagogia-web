import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import fs from 'fs'
import path from 'path'

const DIRS_PERMITIDOS = [
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'private'),
].map(d => path.resolve(d))

/** Resuelve una ruta de archivo evitando path traversal */
function resolverArchivo(ruta: string): string | null {
  if (ruta.includes('..')) return null
  for (const dir of DIRS_PERMITIDOS) {
    const candidato = path.resolve(path.join(dir, ruta))
    if (candidato.startsWith(dir + path.sep) && fs.existsSync(candidato)) return candidato
  }
  return null
}

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

/** GET /api/download/[id] — Descarga un recurso (PDF o editable) */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || '127.0.0.1'
  if (!checkRateLimit(`download:${ip}`, 20, 60_000).allowed) {
    return NextResponse.json({ error: 'Demasiadas descargas. Espera 1 minuto.' }, { status: 429 })
  }

  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })

    const resource = await prisma.resource.findUnique({ where: { id: params.id } })
    if (!resource) return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })

    const promoActiva = !!(resource.promoFreeUntil && new Date(resource.promoFreeUntil) > new Date())
    const esGratisAhora = resource.isFree || promoActiva
    const haPagado = await prisma.orderItem.findFirst({
      where: { resourceId: resource.id, order: { userId: user.id, status: 'completed' } },
    })

    if (!esGratisAhora && !haPagado) {
      return NextResponse.json({ error: 'Debes comprar este recurso' }, { status: 403 })
    }

    /* Promo por tiempo limitado: solo 1 descarga por usuario */
    if (!haPagado && promoActiva) {
      const yaDescargo = await prisma.download.findFirst({
        where: { userId: user.id, resourceId: resource.id },
      })
      if (yaDescargo) {
        return NextResponse.json({
          error: 'Ya descargaste este recurso durante la promo. Cómpralo para descargas ilimitadas.',
        }, { status: 403 })
      }
    }

    const url = new URL(request.url)
    const tipo = url.searchParams.get('type')
    const rutaArchivo = tipo === 'editable' ? resource.editablePath : resource.filePath
    if (!rutaArchivo) return NextResponse.json({ error: 'Archivo no disponible' }, { status: 404 })

    const archivo = resolverArchivo(rutaArchivo)
    if (!archivo) return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })

    /* Registrar descarga (solo PDF, no editable) */
    if (tipo !== 'editable') {
      await prisma.download.create({
        data: { userId: user.id, resourceId: resource.id, ipAddress: ip },
      }).catch(() => {})
      await prisma.resource.update({
        where: { id: resource.id },
        data: { downloadsCount: { increment: 1 } },
      }).catch(() => {})
    }

    const ext = path.extname(archivo).toLowerCase()
    const buffer = fs.readFileSync(archivo)
    const nombreSeguro = resource.title.replace(/[^a-z0-9]+/gi, '-')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${nombreSeguro}${ext}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al descargar' }, { status: 500 })
  }
}
