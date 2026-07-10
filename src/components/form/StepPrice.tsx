'use client'

import { DollarSign, Sparkles, Gem } from 'lucide-react'
import ToggleGroup from '@/components/ToggleGroup'

interface StepPriceProps {
  isFree: boolean
  setIsFree: (v: boolean) => void
  price: string
  setPrice: (v: string) => void
}

export default function StepPrice({ isFree, setIsFree, price, setPrice }: StepPriceProps) {
  return (
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

        <ToggleGroup
          options={[
            { value: 'true', label: 'Gratuito', icon: <Sparkles size={16} />, activeBg: 'bg-emerald-50', activeText: 'text-emerald-700', activeBorder: 'border-emerald-500', iconBg: 'bg-emerald-200', iconColor: 'text-emerald-700' },
            { value: 'false', label: 'Premium', icon: <DollarSign size={16} />, activeBg: 'bg-indigo-50', activeText: 'text-indigo-700', activeBorder: 'border-indigo-500', iconBg: 'bg-indigo-200', iconColor: 'text-indigo-700' },
          ]}
          value={String(isFree)}
          onChange={v => setIsFree(v === 'true')}
        />

        {!isFree && (
          <div className="mt-4 bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-2">
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
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
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
  )
}
