import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para descargar' }, { status: 401 })
    }

    const resource = await prisma.resource.findUnique({ where: { id: params.id } })
    if (!resource) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    const promoActive = resource.promoFreeUntil && new Date(resource.promoFreeUntil) > new Date()

    if (!resource.isFree && !promoActive) {
      const hasPaid = await prisma.orderItem.findFirst({
        where: { resourceId: resource.id, order: { userId: user.id, status: 'completed' } },
      })
      if (!hasPaid) {
        return NextResponse.json({ error: 'Debes comprar este recurso para descargarlo' }, { status: 403 })
      }
    }

    let filepath = path.join(process.cwd(), 'public', resource.filePath)
    if (!fs.existsSync(filepath)) {
      filepath = path.join(process.cwd(), 'private', resource.filePath)
    }
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'Archivo no encontrado en el servidor' }, { status: 404 })
    }

    await prisma.download.create({
      data: { userId: user.id, resourceId: resource.id, ipAddress: '' },
    }).catch(() => {})
    await prisma.resource.update({
      where: { id: resource.id },
      data: { downloadsCount: { increment: 1 } },
    }).catch(() => {})

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
