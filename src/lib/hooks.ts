import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

/** Hook para obtener datos del catálogo con caché SWR y refresh manual */
export function useCatalog() {
  const { data, error, isLoading, mutate } = useSWR('/api/catalog', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })
  return {
    resources: data?.resources || [],
    loading: isLoading,
    error,
    refresh: () => mutate(),
  }
}
