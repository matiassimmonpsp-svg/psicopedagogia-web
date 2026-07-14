'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Lightbulb, Tag } from 'lucide-react'
import { logger } from '@/lib/logger'

const TAG_SUGGESTIONS: Record<string, string[]> = {
  '1_1': ['conciencia fonológica', 'discriminación auditiva', 'vocabulario', 'conciencia semántica'],
  '1_2': ['numeración', 'razonamiento matemático', 'categorización', 'secuencia temporal'],
  '1_3': ['atención', 'percepción visual', 'memoria de trabajo', 'inhibición', 'planificación', 'organización'],
  '2_1': ['conciencia fonológica', 'discriminación auditiva', 'vocabulario', 'conciencia semántica'],
  '2_2': ['numeración', 'razonamiento matemático', 'categorización'],
  '2_3': ['atención', 'percepción visual', 'memoria de trabajo'],
  '3_1': ['fluidez lectora', 'comprensión lectora', 'conciencia fonológica', 'grafomotricidad', 'vocabulario'],
  '3_2': ['numeración', 'razonamiento matemático', 'resolución de problemas'],
  '3_3': ['funciones ejecutivas', 'memoria de trabajo', 'atención', 'inhibición', 'planificación', 'organización'],
  '4_1': ['comprensión lectora', 'fluidez lectora', 'grafomotricidad', 'vocabulario'],
  '4_2': ['razonamiento matemático', 'resolución de problemas', 'numeración'],
  '4_3': ['funciones ejecutivas', 'memoria de trabajo', 'atención', 'inhibición', 'planificación'],
  '5_1': ['comprensión lectora', 'fluidez lectora', 'vocabulario'],
  '5_2': ['razonamiento matemático', 'resolución de problemas'],
  '5_3': ['funciones ejecutivas', 'memoria de trabajo', 'flexibilidad cognitiva', 'atención'],
  '6_1': ['comprensión lectora', 'fluidez lectora', 'conciencia semántica', 'vocabulario'],
  '6_2': ['razonamiento matemático', 'resolución de problemas'],
  '6_3': ['funciones ejecutivas', 'memoria de trabajo', 'flexibilidad cognitiva', 'atención'],
  '7_1': ['comprensión lectora', 'vocabulario'],
  '7_2': ['razonamiento matemático', 'resolución de problemas'],
  '7_3': ['funciones ejecutivas', 'memoria de trabajo', 'flexibilidad cognitiva', 'planificación'],
  '8_1': ['comprensión lectora', 'conciencia semántica', 'vocabulario'],
  '8_2': ['razonamiento matemático', 'resolución de problemas'],
  '8_3': ['funciones ejecutivas', 'memoria de trabajo', 'planificación', 'organización', 'flexibilidad cognitiva'],
  '9_1': ['comprensión lectora', 'vocabulario'],
  '9_2': ['razonamiento matemático', 'resolución de problemas'],
  '9_3': ['funciones ejecutivas', 'planificación', 'organización', 'flexibilidad cognitiva'],
  '10_1': ['comprensión lectora', 'vocabulario'],
  '10_2': ['razonamiento matemático', 'resolución de problemas'],
  '10_3': ['funciones ejecutivas', 'planificación', 'organización', 'memoria de trabajo', 'flexibilidad cognitiva'],
}

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  courseId?: string
  areaId?: string
}

export function TagInput({ value, onChange, courseId, areaId }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(() => value ? value.split(',').map(t => t.trim()).filter(Boolean) : [])
  const [input, setInput] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/tags')
      .then(r => r.json())
      .then(d => setAllTags(d.tags?.map((t: { name: string }) => t.name) || []))
      .catch((err) => logger.error('Error fetching tags', { error: err }))
  }, [])

  useEffect(() => {
    const key = `${courseId}_${areaId}`
    const base = TAG_SUGGESTIONS[key] || []
    setSuggestions(base.filter(t => !tags.includes(t)))
  }, [courseId, areaId, tags])

  useEffect(() => {
    onChange(tags.join(', '))
  }, [tags, onChange])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = input
    ? allTags.filter(t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t))
    : []

  const addTag = useCallback((tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t])
    }
    setInput('')
    setShowDropdown(false)
    setHighlightIdx(-1)
    inputRef.current?.focus()
  }, [tags])

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIdx >= 0 && filtered[highlightIdx]) {
        addTag(filtered[highlightIdx])
      } else if (input.trim()) {
        addTag(input)
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setHighlightIdx(-1)
    }
  }

  return (
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-200 shadow-sm">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          <Tag size={15} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setShowDropdown(true); setHighlightIdx(-1) }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all"
          placeholder={tags.length === 0 ? 'Escribe una etiqueta y presiona Enter...' : 'Agregar más etiquetas...'}
        />

        {showDropdown && filtered.length > 0 && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
            {filtered.map((tag, i) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                  i === highlightIdx ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Plus size={14} className="text-gray-400 shrink-0" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 mb-2">
            <Lightbulb size={13} /> Sugerencias para este curso y área:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="inline-flex items-center gap-1 bg-white hover:bg-purple-100 text-gray-600 hover:text-purple-700 text-xs font-medium px-2.5 py-1.5 rounded-full border border-gray-200 hover:border-purple-200 transition-all shadow-sm"
              >
                <Plus size={10} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="flex items-center gap-1 text-xs text-gray-400">
        <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
        Enter para agregar &middot; Backspace para borrar el último
      </p>
    </div>
  )
}
