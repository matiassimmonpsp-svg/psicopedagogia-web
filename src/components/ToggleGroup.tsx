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
  columns?: number
  ariaLabelledby?: string
}

/** Grupo de botones tipo toggle. Soporta iconos y colores custom. */
export default function ToggleGroup({ options, value, onChange, columns = 2, ariaLabelledby }: Props) {
  const gridCols = columns === 3 ? 'grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
  return (
    <div className={`grid ${gridCols} gap-3`} role="radiogroup" aria-labelledby={ariaLabelledby}>
      {options.map(op => {
        const activo = value === op.value
        return (
          <button
            key={op.value}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(op.value)}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold border-2 transition-all w-full justify-center ${
              activo
                ? `${op.activeBg || 'bg-primary-50'} ${op.activeText || 'text-primary-700'} ${op.activeBorder || 'border-primary-500'} shadow-sm`
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {op.icon && (
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
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
