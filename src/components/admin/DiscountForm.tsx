'use client'

interface DiscountFormProps {
  code: string
  discountPct: string
  maxUses: string
  expiresAt: string
  editingId: number | null
  onCodeChange: (value: string) => void
  onDiscountPctChange: (value: string) => void
  onMaxUsesChange: (value: string) => void
  onExpiresAtChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function DiscountForm({
  code,
  discountPct,
  maxUses,
  expiresAt,
  editingId,
  onCodeChange,
  onDiscountPctChange,
  onMaxUsesChange,
  onExpiresAtChange,
  onSubmit,
  onCancel,
}: DiscountFormProps) {
  return (
    <form onSubmit={onSubmit} className="card p-6 mb-6 max-w-lg">
      <h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Editar código de descuento' : 'Crear código de descuento'}</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
          <input id="discount-code" type="text" value={code} onChange={e => onCodeChange(e.target.value.toUpperCase())} className="input-field" placeholder="EJ: PSICO10" required />
        </div>
        <div>
          <label htmlFor="discount-pct" className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
          <input id="discount-pct" type="number" value={discountPct} onChange={e => onDiscountPctChange(e.target.value)} className="input-field" placeholder="10" min="1" max="100" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="discount-max-uses" className="block text-sm font-medium text-gray-700 mb-1">Usos máximos (opcional)</label>
            <input id="discount-max-uses" type="number" value={maxUses} onChange={e => onMaxUsesChange(e.target.value)} className="input-field" placeholder="Ilimitado" />
          </div>
          <div>
            <label htmlFor="discount-expires" className="block text-sm font-medium text-gray-700 mb-1">Fecha expiración (opcional)</label>
            <input id="discount-expires" type="date" value={expiresAt} onChange={e => onExpiresAtChange(e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">{editingId ? 'Guardar cambios' : 'Crear código'}</button>
          {editingId && <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>}
        </div>
      </div>
    </form>
  )
}
