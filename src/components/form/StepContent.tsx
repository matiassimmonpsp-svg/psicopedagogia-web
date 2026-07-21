'use client'

import { AlignLeft, Type, Tag } from 'lucide-react'
import { TagInput } from '@/components/TagInput'

interface StepContentProps {
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  tagsInput: string
  setTagsInput: (v: string) => void
  courseId: string
  areaId: string
  isEdit: boolean
  selectedCourse?: { name: string }
}

export default function StepContent({ title, setTitle, description, setDescription, tagsInput, setTagsInput, courseId, areaId, isEdit, selectedCourse }: StepContentProps) {
  return (
    <div className="space-y-6">
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
            <label htmlFor="resource-title" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Type size={14} /> Título <span className="text-red-500">*</span>
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 focus-within:bg-white transition-all">
              <div className="flex items-center py-3 px-4">
                <span className="text-gray-300 shrink-0 mr-2">
                  <Type size={16} />
                </span>
                <input
                  id="resource-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onFocus={() => {
                    if (!isEdit && selectedCourse) {
                      const suffix = ` - ${selectedCourse.name}`
                      if (title.endsWith(suffix)) {
                        setTitle(title.slice(0, -suffix.length))
                      }
                    }
                  }}
                  onBlur={() => {
                    if (!isEdit && selectedCourse && title.trim()) {
                      const suffix = ` - ${selectedCourse.name}`
                      if (!title.endsWith(suffix)) {
                        setTitle(title.trim() + suffix)
                      }
                    }
                  }}
                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  placeholder={isEdit ? "Título del recurso" : "Evaluación de Conciencia Fonológica"}
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="resource-description" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <AlignLeft size={14} /> Descripción
            </label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-300">
                <AlignLeft size={16} />
              </span>
              <textarea
                id="resource-description"
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
  )
}
