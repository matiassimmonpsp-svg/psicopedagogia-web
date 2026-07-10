import { allResources } from './mock-data'
import type { Resource } from './interfaces'

export function searchResources(query: string): { results: Resource[]; suggestions: Resource[] } {
  const q = query.toLowerCase().trim()
  if (!q) return { results: [], suggestions: [] }

  const results = allResources.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.tags.some(t => t.includes(q))
  )

  const resultTagSet = new Set(results.flatMap(r => r.tags))
  const resultIds = new Set(results.map(r => r.id))
  const suggestions = allResources.filter(r =>
    !resultIds.has(r.id) &&
    r.tags.some(t => resultTagSet.has(t))
  ).slice(0, 8)

  return { results, suggestions }
}
