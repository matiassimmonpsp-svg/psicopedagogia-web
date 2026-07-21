import type { Metadata } from 'next'
import RegisterPageClient from './RegisterPageClient'

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Regístrate en Psicopedagogía Chile y accede a instrumentos de evaluación psicopedagógica y material educativo.',
}

export default function RegisterPage() {
  return <RegisterPageClient />
}
