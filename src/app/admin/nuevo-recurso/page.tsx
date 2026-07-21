import dynamic from 'next/dynamic'

const ResourceForm = dynamic(() => import('@/components/ResourceForm'))

export default function NewResourcePage() {
  return <ResourceForm mode="create" />
}
