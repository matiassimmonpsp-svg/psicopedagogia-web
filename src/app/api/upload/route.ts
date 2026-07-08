import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { csrfCheck } from '@/lib/csrf'
import fs from 'fs'
import path from 'path'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const MIMES_PERMITIDOS = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg', 'image/webp']
const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  pdf: [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
  docx: [new Uint8Array([0x50, 0x4B, 0x03, 0x04])],
  pptx: [new Uint8Array([0x50, 0x4B, 0x03, 0x04])],
  png: [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  jpg: [new Uint8Array([0xFF, 0xD8, 0xFF])],
  jpeg: [new Uint8Array([0xFF, 0xD8, 0xFF])],
  webp: [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
}
const EXT_POR_MIME: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
}

const SUBDIR: Record<string, string> = {
  pdf: 'private/uploads/pdfs',
  editable: 'private/uploads/pdfs',
  preview: 'private/uploads/previews',
}

/** POST /api/upload — Sube un archivo (PDF, editable o preview) con validación */
export async function POST(request: NextRequest) {
  const csrf = csrfCheck(request)
  if (csrf) return csrf
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const type = form.get('type') as string || 'pdf'

    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

    if (!MIMES_PERMITIDOS.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Máximo 50 MB' }, { status: 400 })
    }

    /* Validación de magic bytes */
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = EXT_POR_MIME[file.type]
    if (!ext) return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 })
    const magicKey = ext.replace('.', '')
    const validMagic = MAGIC_BYTES[magicKey]?.some(m => buffer.subarray(0, m.length).equals(m))
    if (!validMagic) return NextResponse.json({ error: 'Archivo corrupto o inválido' }, { status: 400 })

    const subdir = SUBDIR[type] || 'private/uploads/pdfs'
    const dir = path.join(process.cwd(), subdir)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    fs.writeFileSync(path.join(dir, filename), buffer)
    const url = `/${subdir.replace('private/', '')}/${filename}`

    return NextResponse.json({ url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al subir' }, { status: 500 })
  }
}
