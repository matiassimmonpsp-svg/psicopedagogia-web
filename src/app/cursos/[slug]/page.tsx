import type { Metadata } from 'next'
import { getCourseBySlug, courses as mockCourses } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import CoursePageClient from './CoursePageClient'
import { Breadcrumbs } from '@/components/Breadcrumbs'

type Props = { params: { slug: string }; searchParams: { area?: string; subarea?: string } }

const isProd = process.env.NODE_ENV === 'production'

export const revalidate = 300

export async function generateStaticParams() {
  if (isProd) {
    const courses = await prisma.course.findMany({ where: { isActive: true }, select: { slug: true } })
    return courses.map(c => ({ slug: c.slug }))
  }
  return mockCourses.map(c => ({ slug: c.slug }))
}

async function getCourse(slug: string) {
  if (isProd) {
    return prisma.course.findFirst({ where: { slug, isActive: true } })
  }
  return getCourseBySlug(slug)
}

export async function generateMetadata({ params: p }: Props): Promise<Metadata> {
  const params = await p
  const course = await getCourse(params.slug)

  if (!course) {
    return { title: 'Curso no encontrado', robots: { index: false } }
  }

  const title = `${course.name} | Psicopedagogía Chile`
  const desc = `Material de evaluación psicopedagógica y recursos profesionales para ${course.name}. Explora instrumentos de evaluación por área y subárea.`

  return {
    title,
    description: desc,
    alternates: { canonical: `/cursos/${params.slug}` },
    openGraph: {
      title,
      description: desc,
      type: 'website',
    },
  }
}

export default async function CoursePage({ params: p, searchParams }: Props) {
  const params = await p
  const course = await getCourse(params.slug)
  const crumbs = [
    { label: 'Catálogo', href: '/catalogo' },
    ...(course ? [{ label: course.name }] : []),
  ]
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <CoursePageClient params={params} searchParams={searchParams} />
    </>
  )
}
