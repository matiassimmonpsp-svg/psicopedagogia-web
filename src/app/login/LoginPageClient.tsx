'use client'

import Link from 'next/link'
import { useState, FormEvent, Suspense } from 'react'
import { BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }
    setLoading(true)
    const err = await login(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    toast.success('¡Bienvenido!')
    const raw = searchParams.get('callbackUrl') || searchParams.get('redirect') || '/'
    const callbackUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
    router.push(callbackUrl)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen size={40} className="mx-auto text-primary-600 mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="text-gray-500 mt-1">Accede a tu cuenta de PsicopedagogíaCL</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input id="email" type="email" data-testid="login-email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="ejemplo@correo.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="password" type="password" data-testid="login-password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" data-testid="login-submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta? <Link href="/registro" className="text-primary-600 hover:text-primary-700 font-medium">Regístrate aquí</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
