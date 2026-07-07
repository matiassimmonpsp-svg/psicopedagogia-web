'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Save, FileText, Image, Check, DollarSign, BookOpen, Type, AlignLeft, ArrowLeft, ArrowRight, Eye, Layers, Paperclip, CreditCard, School, BookMarked, Search, X, Sparkles, Tag, Gem, Edit3 } from 'lucide-react'
import { courses, areas, subareas } from '@/lib/data'
import { TagInput } from '@/components/TagInput'

const steps = [
  { num: 1, label: 'Tipo y curso', icon: Layers },
  { num: 2, label: 'Contenido', icon: AlignLeft },
  { num: 3, label: 'Precio', icon: CreditCard },
  { num: 4, label: 'Archivos', icon: Paperclip },
  { num: 5, label: 'Revisar', icon: Eye },
]

export default function NewResourcePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
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
  const [editableFile, setEditableFile] = useState<File | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [uploadingEditable, setUploadingEditable] = useState(false)
  const [uploadingPreview, setUploadingPreview] = useState(false)

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const editableInputRef = useRef<HTMLInputElement>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)

  const filteredSubareas = subareas.filter(s => s.areaId === Number(areaId))

  const selectedCourse = courses.find(c => c.id === Number(courseId))
  const selectedArea = areas.find(a => a.id === Number(areaId))
  const selectedSubarea = subareas.find(s => s.id === Number(subareaId))

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []

  function canContinue(): boolean {
    switch (step) {
      case 1: return !!courseId && !!areaId
      case 2: return !!title.trim()
      case 3: return isFree || (!!price && Number(price) > 0)
      case 4: return !!pdfFile && !!previewFile
      default: return true
    }
  }

  function nextStep() {
    if (canContinue()) setStep(s => Math.min(s + 1, 5))
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1))
  }

  function goToStep(n: number) {
    setStep(n)
  }

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
      let uploadedEditableUrl = ''
      let uploadedPreviewUrl = ''

      if (pdfFile) {
        setUploadingPdf(true)
        uploadedPdfUrl = await uploadFile(pdfFile, 'pdf')
        setUploadingPdf(false)
      }
      if (editableFile) {
        setUploadingEditable(true)
        uploadedEditableUrl = await uploadFile(editableFile, 'editable')
        setUploadingEditable(false)
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
      if (!uploadedPreviewUrl) {
        alert('Debes seleccionar una imagen de portada')
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
          editablePath: uploadedEditableUrl || null,
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

  function handleEditableSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setEditableFile(file)
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recurso creado exitosamente</h2>
          <p className="text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Recurso</h1>
        <p className="text-gray-500 mt-1">Completa los pasos para publicar un recurso educativo.</p>
      </div>

      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-0">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === s.num ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 ring-4 ring-primary-100 scale-110' :
                  step > s.num ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className={`text-[11px] mt-1.5 font-semibold whitespace-nowrap transition-colors ${
                  step === s.num ? 'text-primary-700' :
                  step > s.num ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-[3px] mx-2 mb-6 rounded-full transition-colors ${
                  step > s.num ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Paso 1 — Tipo y curso */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Tipo de material */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-primary-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Tipo de material</h2>
                  <p className="text-sm text-gray-500">¿Esto es una evaluación o un material educativo?</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => setResourceType('evaluation')}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-sm font-semibold ${
                    resourceType === 'evaluation'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    resourceType === 'evaluation' ? 'bg-blue-200' : 'bg-gray-100'
                  }`}>
                    <FileText size={16} className={resourceType === 'evaluation' ? 'text-blue-700' : 'text-gray-500'} />
                  </div>
                  <span>Evaluación informal</span>
                  {resourceType === 'evaluation' && <Check size={16} />}
                </button>
                <button type="button"
                  onClick={() => setResourceType('educational')}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-sm font-semibold ${
                    resourceType === 'educational'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    resourceType === 'educational' ? 'bg-emerald-200' : 'bg-gray-100'
                  }`}>
                    <BookOpen size={16} className={resourceType === 'educational' ? 'text-emerald-700' : 'text-gray-500'} />
                  </div>
                  <span>Material educativo</span>
                  {resourceType === 'educational' && <Check size={16} />}
                </button>
              </div>
            </div>

            {/* Clasificación curricular */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <School size={20} className="text-amber-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Clasificación curricular</h2>
                  <p className="text-sm text-gray-500">Curso, área y subárea a la que pertenece este recurso.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Curso <span className="text-red-500">*</span></label>
                  <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none">
                    <option value="">Seleccionar...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Área <span className="text-red-500">*</span></label>
                  <select value={areaId} onChange={e => { setAreaId(e.target.value); setSubareaId('') }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none">
                    <option value="">Seleccionar...</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Subárea</label>
                  <select value={subareaId} onChange={e => setSubareaId(e.target.value)} disabled={!areaId || filteredSubareas.length === 0} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Opcional</option>
                    {filteredSubareas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2 — Contenido */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Título y descripción */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                  <AlignLeft size={20} className="text-sky-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Título y descripción</h2>
                  <p className="text-sm text-gray-500">Escribe el nombre y una breve descripción del recurso.</p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Type size={14} /> Título <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                      <Type size={16} />
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all"
                      placeholder="Ej: Evaluación de Conciencia Fonológica - 1° Básico"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <AlignLeft size={14} /> Descripción
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-300">
                      <AlignLeft size={16} />
                    </span>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all resize-none"
                      placeholder="Describe brevemente el contenido, objetivo y aplicación del recurso..."
                      maxLength={500}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">{description.length}/500</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Tag size={20} className="text-purple-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Etiquetas (tags)</h2>
                  <p className="text-sm text-gray-500">Palabras clave para que los usuarios encuentren tu recurso.</p>
                </div>
              </div>
              <TagInput
                value={tagsInput}
                onChange={setTagsInput}
                courseId={courseId}
                areaId={areaId}
              />
            </div>
          </div>
        )}

        {/* Paso 3 — Precio */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <DollarSign size={20} className="text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Precio</h2>
                  <p className="text-sm text-gray-500">Define si el recurso será gratuito o de pago.</p>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button type="button"
                  onClick={() => setIsFree(true)}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-sm font-semibold ${
                    isFree
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isFree ? 'bg-emerald-200' : 'bg-gray-100'
                  }`}>
                    <Sparkles size={16} className={isFree ? 'text-emerald-700' : 'text-gray-500'} />
                  </div>
                  <span>Gratuito</span>
                  {isFree && <Check size={16} />}
                </button>
                <button type="button"
                  onClick={() => setIsFree(false)}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-sm font-semibold ${
                    !isFree
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    !isFree ? 'bg-indigo-200' : 'bg-gray-100'
                  }`}>
                    <DollarSign size={16} className={!isFree ? 'text-indigo-700' : 'text-gray-500'} />
                  </div>
                  <span>Premium</span>
                  {!isFree && <Check size={16} />}
                </button>
              </div>

              {!isFree && (
                <div className="bg-white border border-indigo-100 rounded-2xl p-5 mb-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      <Gem size={15} className="text-indigo-500" />
                      Precio en CLP
                    </div>
                    <div className="flex items-center gap-2 flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300 pointer-events-none">$</span>
                      <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                        placeholder="5.990"
                        required
                      />
                      <span className={`text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${
                        price && Number(price) > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
                      }`}>CLP</span>
                      <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-200 whitespace-nowrap">Pago único</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    {price && Number(price) > 0
                      ? `Los usuarios pagarán $${Number(price).toLocaleString('es-CL')} CLP.`
                      : 'Ingresa el valor del recurso.'}
                  </p>
                </div>
              )}

              {isFree && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className="mt-0.5 text-emerald-600" />
                    <p className="text-sm text-emerald-800">
                      Este recurso estará disponible gratuitamente para todos los usuarios registrados.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paso 4 — Archivos */}
        {step === 4 && (
          <div className="space-y-6">
            {/* PDF — Material listo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-primary-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Material para descargar</h2>
                  <p className="text-sm text-gray-500">Sube el PDF listo para que los usuarios lo descarguen.</p>
                </div>
              </div>

              <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfSelect} className="hidden" />

              {pdfFile ? (
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/40 border border-primary-200 rounded-2xl p-5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary-200 rounded-2xl flex items-center justify-center shadow-sm">
                        <FileText size={26} className="text-primary-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{pdfFile.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{(pdfFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setPdfFile(null); if (pdfInputRef.current) pdfInputRef.current.value = '' }} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all">
                      <X size={14} /> Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-gray-300 rounded-2xl py-8 text-center hover:border-primary-400 hover:bg-primary-50/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300 shrink-0">
                      <Upload size={28} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-700 mb-0.5 group-hover:text-primary-700 transition-colors">
                        Haz clic para seleccionar PDF
                      </p>
                      <p className="text-sm text-gray-400">PDF — Máx 50 MB</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadingPdf && (
                <div className="mt-4 flex items-center gap-3 text-sm font-medium text-primary-700 bg-primary-50 rounded-xl px-4 py-3 border border-primary-200">
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  Subiendo PDF...
                </div>
              )}
            </div>

            {/* Archivo editable */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Edit3 size={20} className="text-amber-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Archivo editable</h2>
                  <p className="text-sm text-gray-500">Opcional. Sube el Word o PowerPoint para que los usuarios lo editen.</p>
                </div>
              </div>

              <input ref={editableInputRef} type="file" accept=".docx,.pptx" onChange={handleEditableSelect} className="hidden" />

              {editableFile ? (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200 rounded-2xl p-5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-amber-200 rounded-2xl flex items-center justify-center shadow-sm">
                        <Edit3 size={26} className="text-amber-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{editableFile.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{(editableFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setEditableFile(null); if (editableInputRef.current) editableInputRef.current.value = '' }} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all">
                      <X size={14} /> Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => editableInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-gray-300 rounded-2xl py-8 text-center hover:border-amber-400 hover:bg-amber-50/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300 shrink-0">
                      <Upload size={28} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-700 mb-0.5 group-hover:text-amber-700 transition-colors">
                        Haz clic para seleccionar archivo
                      </p>
                      <p className="text-sm text-gray-400">DOCX o PPTX — Opcional, máx 50 MB</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadingEditable && (
                <div className="mt-4 flex items-center gap-3 text-sm font-medium text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                  <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  Subiendo archivo editable...
                </div>
              )}
            </div>

            {/* Imagen de portada */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Image size={20} className="text-violet-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Imagen de portada</h2>
                  <p className="text-sm text-gray-500">Se mostrará en el catálogo como vista previa del recurso.</p>
                </div>
              </div>

              <input ref={previewInputRef} type="file" accept="image/*" onChange={handlePreviewSelect} className="hidden" required />

              {previewUrl ? (
                <div className="flex flex-col sm:flex-row items-start gap-5 bg-gradient-to-br from-violet-50 to-violet-100/40 border border-violet-200 rounded-2xl p-5 transition-all">
                  <div className="w-full sm:w-28 shrink-0 rounded-xl overflow-hidden border-2 border-violet-200 shadow-sm">
                    <img src={previewUrl} alt="Preview" className="w-full aspect-[3/4] object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{previewFile?.name}</p>
                    <p className="text-xs text-gray-500 mb-4">{(previewFile!.size / 1024).toFixed(0)} KB</p>
                    <button type="button" onClick={() => { setPreviewFile(null); setPreviewUrl(''); if (previewInputRef.current) previewInputRef.current.value = '' }} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all">
                      <X size={14} /> Cambiar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => previewInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-gray-300 rounded-2xl py-8 text-center hover:border-violet-400 hover:bg-violet-50/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-violet-100 group-hover:scale-110 transition-all duration-300 shrink-0">
                      <Image size={28} className="text-gray-400 group-hover:text-violet-600 transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-700 mb-0.5 group-hover:text-violet-700 transition-colors">
                        Haz clic para seleccionar imagen
                      </p>
                      <p className="text-sm text-gray-400">Recomendado: 800×1100 px, JPG o PNG</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadingPreview && (
                <div className="mt-4 flex items-center gap-3 text-sm font-medium text-violet-700 bg-violet-50 rounded-xl px-4 py-3 border border-violet-200">
                  <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                  Subiendo imagen...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paso 5 — Revisar */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-7">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Eye size={20} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Revisa antes de publicar</h2>
                <p className="text-sm text-gray-500">Verifica que todos los datos sean correctos antes de publicar.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3 flex flex-col gap-4">
                {/* Clasificación */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Layers size={14} className="text-primary-700" />
                      </div>
                      Clasificación
                    </div>
                    <button type="button" onClick={() => goToStep(1)} className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <Edit3 size={12} /> Editar
                    </button>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1"><span className="text-gray-500">Tipo:</span> <span className="font-semibold">{resourceType === 'evaluation' ? 'Evaluación informal' : 'Material educativo'}</span></div>
                    <div className="border-t border-gray-200/50" />
                    <div className="flex justify-between items-center py-1"><span className="text-gray-500">Curso:</span> <span className="font-semibold">{selectedCourse?.name}</span></div>
                    <div className="border-t border-gray-200/50" />
                    <div className="flex justify-between items-center py-1"><span className="text-gray-500">Área:</span> <span className="font-semibold">{selectedArea?.name}</span></div>
                    {selectedSubarea && <><div className="border-t border-gray-200/50" /><div className="flex justify-between items-center py-1"><span className="text-gray-500">Subárea:</span> <span className="font-semibold">{selectedSubarea.name}</span></div></>}
                  </div>
                </div>

                {/* Contenido */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                        <AlignLeft size={14} className="text-sky-700" />
                      </div>
                      Contenido
                    </div>
                    <button type="button" onClick={() => goToStep(2)} className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <Edit3 size={12} /> Editar
                    </button>
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
                  <p className="text-xs text-gray-500 mb-3">{description || 'Sin descripción'}</p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(t => (
                        <span key={t} className="bg-white text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 shadow-sm">{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Precio */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CreditCard size={14} className="text-emerald-700" />
                      </div>
                      Precio
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">
                        {isFree
                          ? <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"><Sparkles size={14} /> Gratuito</span>
                          : <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">${Number(price).toLocaleString('es-CL')} CLP</span>
                        }
                      </p>
                      <button type="button" onClick={() => goToStep(3)} className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Edit3 size={12} /> Editar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Archivos */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Paperclip size={14} className="text-violet-700" />
                      </div>
                      Archivos
                    </div>
                    <button type="button" onClick={() => goToStep(4)} className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <Edit3 size={12} /> Editar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <FileText size={18} className="text-primary-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{pdfFile?.name || 'Sin PDF'}</p>
                        <p className="text-xs text-gray-500">Material para descargar</p>
                      </div>
                    </div>
                    {editableFile && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Edit3 size={18} className="text-amber-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{editableFile.name}</p>
                          <p className="text-xs text-gray-500">Archivo editable</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Image size={18} className="text-violet-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{previewFile?.name || 'Sin imagen'}</p>
                        <p className="text-xs text-gray-500">Imagen de portada</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200 h-full flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Vista previa</p>
                  <div className="w-full max-w-xs">
                    <div className="card overflow-hidden rounded-2xl shadow-lg border border-gray-100">
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 flex items-center justify-center relative">
                        {previewUrl ? (
                          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-6">
                            <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <BookOpen size={32} className="text-primary-400" />
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{resourceType === 'educational' ? 'Material' : 'Evaluación'}</p>
                          </div>
                        )}
                        <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${isFree ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {isFree ? 'Gratis' : 'Premium'}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] text-primary-600 font-bold mb-1.5">{selectedCourse?.name}</p>
                        <p className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">{title}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tags.slice(0, 3).map(t => (
                            <span key={t} className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                        <p className={`font-bold text-sm ${isFree ? 'text-emerald-600' : 'text-primary-600'}`}>
                          {isFree ? 'Gratuito' : `$${Number(price).toLocaleString('es-CL')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <ArrowLeft size={16} /> Volver
              </button>
            ) : (
              <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-500 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                Cancelar
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step < 5 && (
              <button type="button" onClick={nextStep} disabled={!canContinue()} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                Continuar <ArrowRight size={16} />
              </button>
            )}
            {step === 5 && (
              <button type="submit" disabled={loading || !pdfFile || !previewFile} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl hover:from-primary-700 hover:to-primary-600 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publicando...</>
                ) : (
                  <><Save size={16} /> Publicar recurso</>
                )}
              </button>
            )}
          </div>
        </div>

        {step < 5 && !canContinue() && (
          <p className="text-xs text-amber-600 font-medium text-right mt-3">Completa los campos obligatorios para continuar</p>
        )}
      </form>
    </div>
  )
}
