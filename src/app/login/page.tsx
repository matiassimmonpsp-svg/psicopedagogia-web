import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginPageClient from './LoginPageClient'

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Inicia sesión en Psicopedagogía Chile para acceder a tus recursos y compras.',
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  )
}
