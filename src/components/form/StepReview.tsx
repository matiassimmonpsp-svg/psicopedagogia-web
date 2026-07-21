'use client'

import { Eye, Layers, AlignLeft, CreditCard, Paperclip, FileText, Image as ImageIcon, Edit3, AlertTriangle, BookOpen, Download, Sparkles } from 'lucide-react'
import { courses, areas, subareas } from '@/lib/data'
import { formatClp } from '@/lib/utils'

interface StepReviewProps {
  resourceType: 'evaluation' | 'educational'
  courseId: string
  areaId: string
  subareaId: string
  title: string
  description: string
  tags: string[]
  isFree: boolean
  price: string
  pdfFile: File | null
  existingPdfPath: string
  editableFile: File | null
  existingEditablePath: string | null
  previewFile: File | null
  previewUrl: string
  existingPreviewPath: string
  isEdit: boolean
  goToStep: (n: number) => void
}

export default function StepReview({
  resourceType, courseId, areaId, subareaId, title, description, tags,
  isFree, price, pdfFile, existingPdfPath, editableFile, existingEditablePath,
  previewFile, previewUrl, existingPreviewPath, isEdit, goToStep,
}: StepReviewProps) {
  const selectedCourse = courses.find(c => c.id === Number(courseId))
  const selectedArea = areas.find(a => a.id === Number(areaId))
  const selectedSubarea = subareas.find(s => s.id === Number(subareaId))

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-7">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <Eye size={20} className="text-green-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Revisa antes de guardar' : 'Revisa antes de publicar'}
          </h2>
          <p className="text-sm text-gray-500">Verifica que todos los datos sean correctos antes de {isEdit ? 'actualizar' : 'publicar'}.</p>
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
            <p className="font-bold text-gray-900 text-sm mb-1">{title || '(Sin título)'}</p>
            {!description ? (
              <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3 border border-amber-200">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">Sin descripción</span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-3 break-words">{description}</p>
            )}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="bg-white text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 shadow-sm">{t}</span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">Sin etiquetas</span>
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
                    : <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">{formatClp(Number(price))} CLP</span>
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
                  <p className="text-sm font-semibold text-gray-900">{pdfFile?.name || (isEdit && existingPdfPath ? 'PDF actual' : 'Sin PDF')}</p>
                  <p className="text-xs text-gray-500">Material para descargar</p>
                </div>
              </div>
              {(editableFile || (isEdit && existingEditablePath)) ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Edit3 size={18} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{editableFile?.name || 'Editable actual'}</p>
                    <p className="text-xs text-gray-500">Archivo editable</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-medium">Sin archivo editable</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <ImageIcon size={18} className="text-violet-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{previewFile?.name || (isEdit && existingPreviewPath !== '/previews/placeholder.svg' ? 'Imagen actual' : 'Sin imagen')}</p>
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
              <div className="card overflow-hidden group">
                <div className="aspect-[3/4] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100">
                  {previewUrl ? (
                    <img src={previewUrl} alt={title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <BookOpen size={40} className="mx-auto text-primary-400 mb-2" />
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{resourceType === 'educational' ? 'Material' : 'Evaluación'}</p>
                    </div>
                  )}
                  {isFree ? (
                    <span className="absolute top-2 right-2 badge-green text-xs z-[2]">Gratis</span>
                  ) : (
                    <span className="absolute top-2 right-2 badge-orange text-xs z-[2]">Premium</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary-600 font-medium mb-1">{selectedCourse?.name}</p>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 break-words">{title || '(Sin título)'}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 break-words">{description || 'Sin descripción'}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.slice(0, 3).map(t => (
                      <span key={t} className="badge bg-gray-100 text-gray-600 text-[10px]">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Download size={12} />
                      0
                    </div>
                    <span className={`font-bold text-sm ${isFree ? 'text-green-600' : 'text-primary-600'}`}>
                      {isFree ? 'Gratuito' : formatClp(Number(price))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
