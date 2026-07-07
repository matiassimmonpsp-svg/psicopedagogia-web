'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Save, FileText, Image, Check } from 'lucide-react'
import { courses, areas, subareas } from '@/lib/data'

export default function NewResourcePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [resourceType, setResourceType] = useState<'evaluation' | 'educational'>('evaluation')
  const [courseId, setCourseId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [subareaId, setSubareaId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('')

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [uploadingPreview, setUploadingPreview] = useState(false)

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)

  const filteredSubareas = subareas.filter(s => s.areaId === Number(areaId))

  async function uploadFile(file: File, type: 'pdf' | 'preview'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Error al subir archivo')
    const data = await res.json()
    return data.url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      let uploadedPdfUrl = ''
      let uploadedPreviewUrl = ''

      if (pdfFile) {
        setUploadingPdf(true)
        uploadedPdfUrl = await uploadFile(pdfFile, 'pdf')
        setUploadingPdf(false)
      }
      if (previewFile) {
        setUploadingPreview(true)
        uploadedPreviewUrl = await uploadFile(previewFile, 'preview')
        setUploadingPreview(false)
      }

      if (!uploadedPdfUrl) {
        alert('Debes seleccionar un archivo PDF')
        setLoading(false)
        return
      }

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          resourceType,
          courseId,
          areaId,
          subareaId,
          isFree,
          priceClp: price || null,
          tags: tagsInput,
          filePath: uploadedPdfUrl,
          previewPath: uploadedPreviewUrl || '/previews/placeholder.svg',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')

      setSuccess(true)
      setTimeout(() => {
        if (data?.resource?.id) router.push(`/recurso/${data.resource.id}`)
        else router.push('/admin')
      }, 1500)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPdfFile(file)
  }

  function handlePreviewSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recurso creado exitosamente</h2>
          <p className="text-gray-500 mt-1">Redirigiendo al panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Nueva Entrada</h1>
      <p className="text-gray-500 mb-8">Agrega un nuevo recurso o material educativo a la plataforma.</p>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Material</label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer ${resourceType === 'evaluation' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                <input type="radio" name="type" checked={resourceType === 'evaluation'} onChange={() => setResourceType('evaluation')} className="accent-primary-600" />
                <span className="text-sm font-medium">Evaluación informal</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer ${resourceType === 'educational' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                <input type="radio" name="type" checked={resourceType === 'educational'} onChange={() => setResourceType('educational')} className="accent-primary-600" />
                <span className="text-sm font-medium">Material educativo</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso (Chile)</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} className="input-field" required>
                <option value="">Seleccionar...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select value={areaId} onChange={e => { setAreaId(e.target.value); setSubareaId('') }} className="input-field" required>
                <option value="">Seleccionar...</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subárea</label>
              <select value={subareaId} onChange={e => setSubareaId(e.target.value)} className="input-field" disabled={!areaId || filteredSubareas.length === 0}>
                <option value="">Opcional</option>
                {filteredSubareas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del Recurso</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Ej: Evaluación de Conciencia Fonológica - 1° Básico" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Breve</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-field resize-none" placeholder="Describe brevemente el contenido y objetivo del recurso..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separados por coma)</label>
            <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="input-field" placeholder="memoria de trabajo, atención, funciones ejecutivas" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
            <div className="flex gap-4 items-center">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer ${isFree ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                <input type="radio" name="pricing" checked={isFree} onChange={() => setIsFree(true)} className="accent-primary-600" />
                <span className="text-sm font-medium">Gratuito</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer ${!isFree ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                <input type="radio" name="pricing" checked={!isFree} onChange={() => setIsFree(false)} className="accent-primary-600" />
                <span className="text-sm font-medium">Premium</span>
              </label>
              {!isFree && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">$</span>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="input-field w-32" placeholder="5990" />
                  <span className="text-sm text-gray-500">CLP</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF *</label>
            <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfSelect} className="hidden" />
            <div
              onClick={() => pdfInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            >
              {pdfFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={20} className="text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">{pdfFile.name}</span>
                  <span className="text-xs text-gray-400">({(pdfFile.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Haz clic para seleccionar el PDF</p>
                </>
              )}
            </div>
            {uploadingPdf && <p className="text-xs text-primary-600 mt-1">Subiendo PDF...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vista Previa (Portada)</label>
            <input ref={previewInputRef} type="file" accept="image/*" onChange={handlePreviewSelect} className="hidden" />
            <div
              onClick={() => previewInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            >
              {previewUrl ? (
                <div className="flex items-center justify-center gap-2">
                  <Image size={20} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{previewFile?.name || 'Imagen seleccionada'}</span>
                </div>
              ) : (
                <>
                  <Image size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Selecciona la imagen de portada (opcional)</p>
                  <p className="text-xs text-gray-400 mt-1">Recomendado: 800x1100px, JPG o PNG</p>
                </>
              )}
            </div>
            {uploadingPreview && <p className="text-xs text-primary-600 mt-1">Subiendo imagen...</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            {loading ? 'Guardando...' : <><Save size={16} /> Guardar y Publicar</>}
          </button>
        </div>
      </form>
    </div>
  )
}
