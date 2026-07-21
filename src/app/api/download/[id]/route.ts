import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enforceRateLimit, requireSession } from '@/lib/api-helpers'
import { getClientIp, hashIp } from '@/lib/rate-limit'
import { generateSlug } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'

const DIRS_PERMITIDOS = [
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'private'),
].map(d => path.resolve(d))

/** Resuelve una ruta de archivo evitando path traversal */
function resolverArchivo(ruta: string): string | null {
  if (ruta.includes('..')) return null
  for (const dir of DIRS_PERMITIDOS) {
    const candidato = path.resolve(path.join(dir, ruta))
    if (candidato.startsWith(dir + path.sep) && existsSync(candidato)) return candidato
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
export async function GET(request: NextRequest, { params: p }: { params: { id: string } }) {
  const params = await p
  const rateLimited = await enforceRateLimit(request, 'download', 20)
  if (rateLimited) return rateLimited

  const ip = getClientIp(request.headers)
  try {
    const user = await requireSession()
    if (user instanceof NextResponse) return user

    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: { area: { select: { isActive: true } } },
    })
    if (!resource) return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })

    if (user.role !== 'admin') {
      if (resource.isActive === false) {
        return NextResponse.json({ error: 'Este recurso no está disponible temporalmente debido a ajustes en su contenido.' }, { status: 403 })
      }

      if (resource.area?.isActive === false) {
        return NextResponse.json({ error: 'El área de este recurso no está disponible temporalmente. Vuelve a intentar más adelante.' }, { status: 403 })
      }
    }

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

    /* Registrar descarga (solo PDF, no editable) — parallelize independent writes */
    if (tipo !== 'editable') {
      await Promise.all([
        prisma.download.create({
          data: { userId: user.id, resourceId: resource.id, ipAddress: hashIp(ip) },
        }).catch((err: unknown) => {
          logger.warn('Error al registrar descarga', { error: err instanceof Error ? err.message : err })
        }),
        prisma.resource.update({
          where: { id: resource.id },
          data: { downloadsCount: { increment: 1 } },
        }).catch((err: unknown) => {
          logger.warn('Error al incrementar contador de descargas', { error: err instanceof Error ? err.message : err })
        }),
      ])
    }

    const ext = path.extname(archivo).toLowerCase()
    const nombreSeguro = generateSlug(resource.title)
    const fileStat = await stat(archivo)
    const fileStream = createReadStream(archivo)
    const webStream = Readable.toWeb(fileStream) as ReadableStream

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${nombreSeguro}${ext}"`,
        'Content-Length': fileStat.size.toString(),
      },
    })
  } catch (err: unknown) {
    logger.error('Error al descargar recurso', { error: err instanceof Error ? err.message : err })
    return NextResponse.json({ error: 'Error al descargar' }, { status: 500 })
  }
}
