'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Upload, Save, FileText, Image, Check, Clock } from 'lucide-react'
import { courses, areas, subareas } from '@/lib/data'
import { TagInput } from '@/components/TagInput'

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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

  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promoDuration, setPromoDuration] = useState('24')

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)

  const filteredSubareas = subareas.filter(s => s.areaId === Number(areaId))

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resources/${params.id}`)
        const data = await res.json()
        if (!res.ok || !data.resource) throw new Error(data.error || 'No encontrado')
        const r = data.resource
        setTitle(r.title)
        setDescription(r.description || '')
        setResourceType(r.resourceType)
        setCourseId(String(r.courseId))
        setAreaId(String(r.areaId))
        setSubareaId(r.subareaId ? String(r.subareaId) : '')
        setIsFree(r.isFree)
        setPrice(r.priceClp ? String(r.priceClp) : '')
        setTagsInput(r.tags?.map((t: any) => t.tag?.name || t.name).join(', ') || '')
        setPreviewUrl(r.previewPath || '')
        if (r.promoFreeUntil) {
          const until = new Date(r.promoFreeUntil)
          if (until > new Date()) {
            setPromoEnabled(true)
            const hoursLeft = Math.round((until.getTime() - Date.now()) / 3600000)
            setPromoDuration(String(Math.max(1, hoursLeft)))
          }
        }
      } catch (err: any) {
        alert(err.message)
        router.push('/admin')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [params.id, router])

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

      let promoFreeUntil: string | null = null
      if (promoEnabled && !isFree) {
        const hours = parseInt(promoDuration)
        if (hours > 0 && hours <= 168) {
          const d = new Date()
          d.setHours(d.getHours() + hours)
          promoFreeUntil = d.toISOString()
        }
      }

      const res = await fetch(`/api/resources/${params.id}`, {
        method: 'PUT',
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
          filePath: uploadedPdfUrl || undefined,
          previewPath: uploadedPreviewUrl || undefined,
          promoFreeUntil,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')

      setSuccess(true)
      setTimeout(() => router.push('/admin'), 1500)
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

  if (fetching) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Cargando...</p></div>
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recurso actualizado</h2>
          <p className="text-gray-500 mt-1">Redirigiendo al panel...</p>
        </div>
      </div>
    )
  }

  const showPromoSection = !isFree

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Recurso</h1>
      <p className="text-gray-500 mb-8">Actualiza los datos del recurso existente.</p>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <TagInput
              value={tagsInput}
              onChange={setTagsInput}
              courseId={courseId}
              areaId={areaId}
            />
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

          {showPromoSection && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={promoEnabled} onChange={e => setPromoEnabled(e.target.checked)} className="accent-amber-600" />
                <span className="text-sm font-medium text-amber-800 flex items-center gap-1">
                  <Clock size={16} /> Activar promoción — gratis por tiempo limitado
                </span>
              </label>
              {promoEnabled && (
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-sm text-amber-700">Gratis durante</span>
                  <select value={promoDuration} onChange={e => setPromoDuration(e.target.value)} className="input-field w-40 text-sm">
                    <option value="1">1 hora</option>
                    <option value="2">2 horas</option>
                    <option value="6">6 horas</option>
                    <option value="12">12 horas</option>
                    <option value="24">24 horas</option>
                    <option value="48">2 días</option>
                    <option value="72">3 días</option>
                    <option value="168">1 semana</option>
                  </select>
                  <span className="text-xs text-amber-600">(máx. 1 semana)</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
            <input ref={pdfInputRef} type="file" accept=".pdf,.docx,.pptx" onChange={handlePdfSelect} className="hidden" />
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
                  <p className="text-sm text-gray-500">Deja vacío para mantener el PDF actual</p>
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
                  <span className="text-sm font-medium text-gray-700">{previewFile?.name || 'Imagen actual'}</span>
                </div>
              ) : (
                <>
                  <Image size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Selecciona nueva imagen de portada (opcional)</p>
                  <p className="text-xs text-gray-400 mt-1">Deja vacío para mantener la actual</p>
                </>
              )}
            </div>
            {uploadingPreview && <p className="text-xs text-primary-600 mt-1">Subiendo imagen...</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            {loading ? 'Guardando...' : <><Save size={16} /> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  )
}
