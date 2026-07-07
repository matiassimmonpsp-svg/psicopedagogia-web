import type { Resource } from './data'

export function formatClp(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

export function hasActivePromo(resource: Resource | null | undefined): boolean {
  if (!resource?.promoFreeUntil) return false
  return new Date(resource.promoFreeUntil) > new Date()
}

export function getPromoEndDate(resource: Resource | null | undefined): Date | null {
  if (!resource?.promoFreeUntil) return null
  const d = new Date(resource.promoFreeUntil)
  return d > new Date() ? d : null
}