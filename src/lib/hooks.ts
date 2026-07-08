import useSWR from 'swr'
import type { Resource } from '@/lib/data'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useCatalog() {
  const { data, error, isLoading, mutate } = useSWR('/api/catalog', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30_000,
  })

  return {
    resources: (data?.resources || []) as Resource[],
    loading: isLoading,
    error,
    refresh: mutate,
  }
}
