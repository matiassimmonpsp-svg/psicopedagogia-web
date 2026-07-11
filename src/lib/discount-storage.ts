/**
 * Helpers para persistir datos de descuento en sessionStorage.
 * Evita duplicar la lógica de lectura/escritura/limpieza entre páginas.
 */

const KEYS = {
  code: 'discountCode',
  amount: 'discountAmount',
  percent: 'discountPercent',
} as const

/** Guarda los datos del descuento aplicado en sessionStorage */
export function saveDiscountToSession(code: string, amount: number, percent: number) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(KEYS.code, code)
  sessionStorage.setItem(KEYS.amount, String(amount))
  sessionStorage.setItem(KEYS.percent, String(percent))
}

/** Carga los datos del descuento desde sessionStorage. Retorna null si no hay nada guardado. */
export function loadDiscountFromSession(): { code: string; amount: number; percent: number } | null {
  if (typeof window === 'undefined') return null
  const code = sessionStorage.getItem(KEYS.code)
  const amount = sessionStorage.getItem(KEYS.amount)
  const percent = sessionStorage.getItem(KEYS.percent)
  if (!code || !amount) return null
  return {
    code,
    amount: Number(amount),
    percent: Number(percent) || 0,
  }
}

/** Elimina todos los datos de descuento del sessionStorage */
export function clearDiscountFromSession() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEYS.code)
  sessionStorage.removeItem(KEYS.amount)
  sessionStorage.removeItem(KEYS.percent)
}
