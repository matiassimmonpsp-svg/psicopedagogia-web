'use client'

import type { ReactNode } from 'react'

interface Opcion {
  value: string
  label: string
  icon?: ReactNode
  activeBg?: string
  activeText?: string
  activeBorder?: string
  iconBg?: string
  iconColor?: string
}

interface Props {
  options: Opcion[]
  value: string
  onChange: (value: string) => void
}

/** Grupo de botones tipo toggle pill. Soporta iconos y colores custom. */
export default function ToggleGroup({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(op => {
        const activo = value === op.value
        return (
          <button
            key={op.value}
            type="button"
            onClick={() => onChange(op.value)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
              activo
                ? `${op.activeBg || 'bg-primary-50'} ${op.activeText || 'text-primary-700'} ${op.activeBorder || 'border-primary-500'} shadow-sm`
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {op.icon && (
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                activo ? op.iconBg || 'bg-primary-200' : 'bg-gray-100'
              } ${activo ? op.iconColor || 'text-primary-700' : 'text-gray-500'}`}
              >
                {op.icon}
              </span>
            )}
            {op.label}
          </button>
        )
      })}
    </div>
  )
}
