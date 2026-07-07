'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    const err = await register(name, email, password)
    setLoading(false)
    if (err) setError(err)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen size={40} className="mx-auto text-primary-600 mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-500 mt-1">Accede a recursos gratuitos y mucho más</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="María González" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="ejemplo@correo.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Mínimo 6 caracteres" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta? <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Inicia sesión</Link>
          </p>
          <p className="text-xs text-gray-400 text-center">Al registrarte, aceptas nuestros Términos y Condiciones y Política de Privacidad.</p>
        </form>
      </div>
    </div>
  )
}
