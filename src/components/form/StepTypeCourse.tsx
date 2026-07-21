'use client'

import { BookOpen, FileText, School } from 'lucide-react'
import ToggleGroup from '@/components/ToggleGroup'
import type { Course, Area, Subarea } from '@/lib/interfaces'

interface StepTypeCourseProps {
  resourceType: 'evaluation' | 'educational'
  setResourceType: (v: 'evaluation' | 'educational') => void
  courseId: string
  setCourseId: (v: string) => void
  areaId: string
  setAreaId: (v: string) => void
  subareaId: string
  setSubareaId: (v: string) => void
  courses: Course[]
  areas: Area[]
  subareas: Subarea[]
  loading: boolean
}

export default function StepTypeCourse({ resourceType, setResourceType, courseId, setCourseId, areaId, setAreaId, subareaId, setSubareaId, courses, areas, subareas, loading }: StepTypeCourseProps) {
  const filteredSubareas = subareas.filter(s => s.areaId === Number(areaId))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando cursos y áreas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 transition-shadow hover:shadow-md">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <BookOpen size={20} className="text-primary-700" />
          </div>
          <div>
            <h2 id="step-type-heading" className="text-lg font-bold text-gray-900">Tipo de material</h2>
            <p className="text-sm text-gray-500">¿Esto es una evaluación o un material educativo?</p>
          </div>
        </div>
        <ToggleGroup
          ariaLabelledby="step-type-heading"
          options={[
            { value: 'evaluation', label: 'Evaluación informal', icon: <FileText size={16} />, activeBg: 'bg-primary-50', activeText: 'text-primary-700', activeBorder: 'border-primary-500', iconBg: 'bg-blue-200', iconColor: 'text-blue-700' },
            { value: 'educational', label: 'Material educativo', icon: <BookOpen size={16} />, activeBg: 'bg-primary-50', activeText: 'text-primary-700', activeBorder: 'border-primary-500', iconBg: 'bg-emerald-200', iconColor: 'text-emerald-700' },
          ]}
          value={resourceType}
          onChange={v => setResourceType(v as 'evaluation' | 'educational')}
        />
      </div>

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
            <label htmlFor="course-select" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Curso <span className="text-red-400">*</span></label>
            <select id="course-select" value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none">
              <option value="">Seleccionar...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="area-select" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Área <span className="text-red-400">*</span></label>
            <select id="area-select" value={areaId} onChange={e => { setAreaId(e.target.value); setSubareaId('') }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none">
              <option value="">Seleccionar...</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="subarea-select" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subárea <span className="text-xs text-gray-400 font-normal normal-case">(opcional)</span></label>
            <select id="subarea-select" value={subareaId} onChange={e => setSubareaId(e.target.value)} disabled={!areaId || filteredSubareas.length === 0} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">Seleccionar...</option>
              {filteredSubareas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
