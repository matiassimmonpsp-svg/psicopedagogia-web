import ResourceForm from '@/components/ResourceForm'

export default function EditResourcePage({ params }: { params: { id: string } }) {
  return <ResourceForm mode="edit" resourceId={params.id} />
}
