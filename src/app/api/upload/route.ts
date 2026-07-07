import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth'

const ALLOWED_TYPES: Record<string, string[]> = {
  pdf: ['.pdf'],
  preview: ['.png', '.jpg', '.jpeg', '.webp'],
}
const MAX_SIZE = 20 * 1024 * 1024

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'pdf'

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo supera el límite de 20 MB' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    const allowed = ALLOWED_TYPES[type] || ALLOWED_TYPES.pdf

    if (!allowed.includes(ext)) {
      return NextResponse.json({
        error: `Tipo de archivo no permitido. Extensiones aceptadas: ${allowed.join(', ')}`,
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

    if (type === 'preview') {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'previews')
      await mkdir(dir, { recursive: true })
      const filepath = path.join(dir, name)
      await writeFile(filepath, buffer)

      return NextResponse.json({
        url: `/uploads/previews/${name}`,
        name: file.name,
      })
    }

    const dir = path.join(process.cwd(), 'private', 'uploads', 'pdfs')
    await mkdir(dir, { recursive: true })
    const filepath = path.join(dir, name)
    await writeFile(filepath, buffer)

    return NextResponse.json({
      url: `/uploads/pdfs/${name}`,
      name: file.name,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al subir archivo' }, { status: 500 })
  }
}
