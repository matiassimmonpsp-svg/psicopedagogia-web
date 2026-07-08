'use client'

import { Check } from 'lucide-react'

interface ToggleOption {
  value: string
  label: string
  icon: React.ReactNode
  activeBg: string
  activeText: string
  activeBorder: string
  iconBg: string
  iconColor: string
}

interface ToggleGroupProps {
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
}

export default function ToggleGroup({ options, value, onChange }: ToggleGroupProps) {
  return (
    <div className="flex gap-3">
      {options.map(opt => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-sm font-semibold ${
              isActive
                ? `${opt.activeBorder} ${opt.activeBg} ${opt.activeText} shadow-sm`
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isActive ? opt.iconBg : 'bg-gray-100'
            }`}>
              <span className={isActive ? opt.iconColor : 'text-gray-500'}>{opt.icon}</span>
            </div>
            <span>{opt.label}</span>
            {isActive && <Check size={16} />}
          </button>
        )
      })}
    </div>
  )
}
