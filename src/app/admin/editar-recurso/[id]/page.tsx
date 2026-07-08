'use client'

import { useParams } from 'next/navigation'
import ResourceForm from '@/components/ResourceForm'

export default function EditResourcePage() {
  const params = useParams()
  return <ResourceForm mode="edit" resourceId={params.id as string} />
}
