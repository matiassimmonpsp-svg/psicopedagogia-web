'use client'

import { useRef } from 'react'
import { Upload, FileText, Image, Edit3, X } from 'lucide-react'

interface StepFilesProps {
  isEdit: boolean
  pdfFile: File | null
  setPdfFile: (v: File | null) => void
  existingPdfPath: string
  editableFile: File | null
  setEditableFile: (v: File | null) => void
  existingEditablePath: string | null
  setExistingEditablePath: (v: string | null) => void
  previewFile: File | null
  setPreviewFile: (v: File | null) => void
  previewUrl: string
  setPreviewUrl: (v: string) => void
  existingPreviewPath: string
  uploadingPdf: boolean
  uploadingEditable: boolean
  uploadingPreview: boolean
}

export default function StepFiles({
  isEdit, pdfFile, setPdfFile, existingPdfPath,
  editableFile, setEditableFile, existingEditablePath, setExistingEditablePath,
  previewFile, setPreviewFile, previewUrl, setPreviewUrl, existingPreviewPath,
  uploadingPdf, uploadingEditable, uploadingPreview,
}: StepFilesProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const editableInputRef = useRef<HTMLInputElement>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="space-y-6">
      {/* PDF */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-primary-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Material para descargar</h2>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Sube el PDF listo para que los usuarios lo descarguen. Deja vacío para mantener el actual.' : 'Sube el PDF listo para que los usuarios lo descarguen.'}
            </p>
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
        ) : isEdit && existingPdfPath ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-2xl p-5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText size={26} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PDF actual</p>
                  <p className="text-xs text-gray-500 mt-0.5">Archivo existente</p>
                </div>
              </div>
              <button type="button" onClick={() => pdfInputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all">
                <Upload size={14} /> Reemplazar
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
            <p className="text-sm text-gray-500">
              {isEdit ? 'Opcional. Sube el Word o PowerPoint. Deja vacío para mantener el actual.' : 'Opcional. Sube el Word o PowerPoint para que los usuarios lo editen.'}
            </p>
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
        ) : isEdit && existingEditablePath ? (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200 rounded-2xl p-5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Edit3 size={26} className="text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Archivo editable actual</p>
                  <p className="text-xs text-gray-500 mt-0.5">Existente</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => editableInputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all">
                  <Upload size={14} /> Reemplazar
                </button>
                <button type="button" onClick={() => { setExistingEditablePath(null); setEditableFile(null); }} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all">
                  <X size={14} /> Eliminar
                </button>
              </div>
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
            <p className="text-sm text-gray-500">
              {isEdit ? 'Se mostrará en el catálogo. Deja vacío para mantener la actual.' : 'Se mostrará en el catálogo como vista previa del recurso.'}
            </p>
          </div>
        </div>

        <input ref={previewInputRef} type="file" accept="image/*" onChange={handlePreviewSelect} className="hidden" {...(isEdit ? {} : { required: true })} />

        {previewUrl ? (
          <div className="flex flex-col sm:flex-row items-start gap-5 bg-gradient-to-br from-violet-50 to-violet-100/40 border border-violet-200 rounded-2xl p-5 transition-all">
            <div className="w-full sm:w-28 shrink-0 rounded-xl overflow-hidden border-2 border-violet-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="w-full aspect-[3/4] object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">{previewFile?.name || 'Imagen actual'}</p>
              {previewFile && <p className="text-xs text-gray-500 mb-4">{(previewFile.size / 1024).toFixed(0)} KB</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => previewInputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all">
                  <Upload size={14} /> Cambiar
                </button>
                {previewFile && (
                  <button type="button" onClick={() => { setPreviewFile(null); setPreviewUrl(existingPreviewPath); if (previewInputRef.current) previewInputRef.current.value = '' }} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all">
                    <X size={14} /> Revertir
                  </button>
                )}
              </div>
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
  )
}
