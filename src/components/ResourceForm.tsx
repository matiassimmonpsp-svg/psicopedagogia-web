'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Check, ArrowLeft, ArrowRight, Eye } from 'lucide-react'
import { useCoursesData } from '@/lib/hooks'
import StepTypeCourse from '@/components/form/StepTypeCourse'
import StepContent from '@/components/form/StepContent'
import StepPrice from '@/components/form/StepPrice'
import StepFiles from '@/components/form/StepFiles'
import StepReview from '@/components/form/StepReview'

interface ResourceFormProps {
  mode: 'create' | 'edit'
  resourceId?: string
}

const steps = [
  { num: 1, label: 'Tipo y curso' },
  { num: 2, label: 'Contenido' },
  { num: 3, label: 'Precio' },
  { num: 4, label: 'Archivos' },
  { num: 5, label: 'Revisar' },
]

export default function ResourceForm({ mode, resourceId }: ResourceFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const { courses, areas, subareas, loading: coursesLoading } = useCoursesData()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
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
  const [existingPdfPath, setExistingPdfPath] = useState('')
  const [editableFile, setEditableFile] = useState<File | null>(null)
  const [existingEditablePath, setExistingEditablePath] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [existingPreviewPath, setExistingPreviewPath] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [uploadingEditable, setUploadingEditable] = useState(false)
  const [uploadingPreview, setUploadingPreview] = useState(false)

  const selectedCourse = courses.find(c => c.id === Number(courseId))
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []

  useEffect(() => {
    if (!isEdit) return
    async function load() {
      try {
        const res = await fetch(`/api/resources/${resourceId}`)
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
        setTagsInput(r.tags?.map((t: { tag?: { name: string }; name?: string }) => t.tag?.name || t.name).join(', ') || '')
        setExistingPdfPath(r.filePath || '')
        setExistingEditablePath(r.editablePath || null)
        setExistingPreviewPath(r.previewPath || '/previews/placeholder.svg')
        setPreviewUrl(r.previewPath || '')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar recurso')
        router.push('/admin')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [isEdit, resourceId, router])

  function canContinue(): boolean {
    switch (step) {
      case 1: return !!courseId && !!areaId
      case 2: return !!title.trim()
      case 3: return isFree || (!!price && Number(price) > 0)
      case 4: return isEdit ? (!!pdfFile || !!existingPdfPath) : (!!pdfFile && !!previewFile)
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

  async function uploadFile(file: File, type: 'pdf' | 'editable' | 'preview'): Promise<string> {
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

    const finalTitle = title

    try {
      let uploadedPdfUrl = isEdit ? existingPdfPath : ''
      let uploadedEditableUrl = isEdit ? existingEditablePath : ''
      let uploadedPreviewUrl = isEdit ? existingPreviewPath : ''

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

      if (isEdit) {
        if (!uploadedPdfUrl) {
          toast.error('Debes tener un archivo PDF')
          setLoading(false)
          return
        }

        const res = await fetch(`/api/resources/${resourceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: finalTitle, description, resourceType, courseId, areaId, subareaId,
            isFree, priceClp: price || null, tags,
            filePath: pdfFile ? uploadedPdfUrl : undefined,
            editablePath: editableFile ? uploadedEditableUrl : (existingEditablePath !== null ? existingEditablePath : null),
            previewPath: previewFile ? uploadedPreviewUrl : undefined,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al guardar')
        setSuccess(true)
        setTimeout(() => router.push('/admin'), 1500)
      } else {
        if (!uploadedPdfUrl) {
          toast.error('Debes seleccionar un archivo PDF')
          setLoading(false)
          return
        }
        if (!uploadedPreviewUrl) {
          toast.error('Debes seleccionar una imagen de portada')
          setLoading(false)
          return
        }

        const res = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: finalTitle, description, resourceType, courseId, areaId, subareaId,
            isFree, priceClp: price || null, tags,
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
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar recurso')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Cargando...</p></div>

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Recurso actualizado' : 'Recurso creado exitosamente'}
          </h2>
          <p className="text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Recurso' : 'Nuevo Recurso'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit ? 'Actualiza los datos del recurso existente.' : 'Completa los pasos para publicar un recurso educativo.'}
        </p>
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
        {step === 1 && <StepTypeCourse resourceType={resourceType} setResourceType={setResourceType} courseId={courseId} setCourseId={setCourseId} areaId={areaId} setAreaId={setAreaId} subareaId={subareaId} setSubareaId={setSubareaId} courses={courses} areas={areas} subareas={subareas} loading={coursesLoading} />}
        {step === 2 && <StepContent title={title} setTitle={setTitle} description={description} setDescription={setDescription} tagsInput={tagsInput} setTagsInput={setTagsInput} courseId={courseId} areaId={areaId} isEdit={isEdit} selectedCourse={selectedCourse} />}
        {step === 3 && <StepPrice isFree={isFree} setIsFree={setIsFree} price={price} setPrice={setPrice} />}
        {step === 4 && <StepFiles isEdit={isEdit} pdfFile={pdfFile} setPdfFile={setPdfFile} existingPdfPath={existingPdfPath} editableFile={editableFile} setEditableFile={setEditableFile} existingEditablePath={existingEditablePath} setExistingEditablePath={setExistingEditablePath} previewFile={previewFile} setPreviewFile={setPreviewFile} previewUrl={previewUrl} setPreviewUrl={setPreviewUrl} existingPreviewPath={existingPreviewPath} uploadingPdf={uploadingPdf} uploadingEditable={uploadingEditable} uploadingPreview={uploadingPreview} />}
        {step === 5 && <StepReview resourceType={resourceType} courseId={courseId} areaId={areaId} subareaId={subareaId} title={title} description={description} tags={tags} isFree={isFree} price={price} pdfFile={pdfFile} existingPdfPath={existingPdfPath} editableFile={editableFile} existingEditablePath={existingEditablePath} previewFile={previewFile} previewUrl={previewUrl} existingPreviewPath={existingPreviewPath} isEdit={isEdit} goToStep={goToStep} />}

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
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl hover:from-primary-700 hover:to-primary-600 active:scale-[0.97] transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {isEdit ? 'Guardando...' : 'Publicando...'}</>
                ) : (
                  <><Save size={16} /> {isEdit ? 'Guardar cambios' : 'Publicar recurso'}</>
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
