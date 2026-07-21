import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    // No Prisma calls needed for upload
  },
}))

vi.mock('@/lib/csrf', () => ({ csrfCheck: vi.fn().mockReturnValue(null) }))
vi.mock('@/lib/auth', () => ({ requireAdmin: vi.fn() }))

import { POST as uploadPOST } from '@/app/api/upload/route'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as fsPromises from 'fs/promises'
import * as path from 'path'

vi.mock('fs')
vi.mock('fs/promises')
vi.mock('path')

const makeReq = (file: File | null, type = 'pdf') => {
  const formData = new FormData()
  if (file) formData.append('file', file)
  formData.append('type', type)
  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  })
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdmin).mockResolvedValue({ id: '1', name: 'Admin', email: 'a@b.cl', role: 'admin' })
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined)
    vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined)
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'))
    vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'))
  })

  it('returns 401 when not admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null)
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const req = makeReq(file)
    const res = await uploadPOST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when file is missing', async () => {
    const req = makeReq(null)
    const res = await uploadPOST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Archivo requerido')
  })

  it('returns 400 when MIME type is not allowed', async () => {
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
    const req = makeReq(file)
    const res = await uploadPOST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Tipo de archivo no permitido')
  })

  it('returns 400 when file exceeds max size', async () => {
    const largeContent = 'a'.repeat(51 * 1024 * 1024) // 51 MB
    const file = new File([largeContent], 'test.pdf', { type: 'application/pdf' })
    const req = makeReq(file)
    const res = await uploadPOST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Máximo 50 MB')
  })

  it('returns 400 when magic bytes do not match', async () => {
    // PDF magic bytes are %PDF, but we provide PNG content
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47])
    const file = new File([pngBytes], 'test.pdf', { type: 'application/pdf' })
    const req = makeReq(file)
    const res = await uploadPOST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Archivo corrupto o inválido')
  })

  it('uploads PDF successfully', async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]) // %PDF
    const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' })
    const req = makeReq(file)
    const res = await uploadPOST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBeDefined()
    expect(data.url).toContain('.pdf')
  })

  it('uploads editable file (docx) successfully', async () => {
    const zipBytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04]) // ZIP magic bytes
    const file = new File([zipBytes], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const req = makeReq(file, 'editable')
    const res = await uploadPOST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBeDefined()
    expect(data.url).toContain('.docx')
  })

  it('uploads preview image successfully', async () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47])
    const file = new File([pngBytes], 'test.png', { type: 'image/png' })
    const req = makeReq(file, 'preview')
    const res = await uploadPOST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBeDefined()
    expect(data.url).toContain('.png')
  })

  it('returns 500 on unexpected error', async () => {
    vi.mocked(fsPromises.writeFile).mockRejectedValue(new Error('Disk full'))
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' })
    const req = makeReq(file)
    const res = await uploadPOST(req)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Error al subir')
  })
})