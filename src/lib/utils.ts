// ============================================================
// Utilidades del frontend (cliente)
// ============================================================

/** Normaliza texto: minúsculas, sin tildes, sin caracteres especiales */
export function normalizeText(t: string): string {
  return t.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
}

/** Expande una consulta de búsqueda en tokens individuales */
export function expandSearchQuery(query: string): string[] {
  return normalizeText(query).split(/\s+/).filter(Boolean)
}

/** Formatea un número como pesos chilenos (CLP) */
export function formatClp(valor: number): string {
  return `$${Math.round(valor).toLocaleString('es-CL')}`
}

/** Verifica si un recurso tiene una promoción activa */
export function hasActivePromo(resource: { promoFreeUntil?: string | Date | null }): boolean {
  if (!resource.promoFreeUntil) return false
  return new Date(resource.promoFreeUntil) > new Date()
}

/** Genera un slug URL-friendly a partir de un nombre */
export function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Descarga un archivo desde una URL y lo guarda con el nombre indicado */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url)
  if (res.status === 401) throw new Error('No autorizado')
  if (res.status === 403) throw new Error('Debes comprar este recurso para descargarlo')
  if (!res.ok) throw new Error(await res.json().then(d => d.error).catch(() => 'Error al descargar'))
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}