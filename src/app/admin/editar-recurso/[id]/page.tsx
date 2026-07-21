import dynamic from 'next/dynamic'

const ResourceForm = dynamic(() => import('@/components/ResourceForm'))

export default function EditResourcePage({ params }: { params: { id: string } }) {
  return <ResourceForm mode="edit" resourceId={params.id} />
}
