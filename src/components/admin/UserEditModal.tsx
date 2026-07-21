'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface UserEditModalProps {
  user: { id: string; name: string; email: string }
  name: string
  email: string
  password: string
  saving: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSave: () => void
  onClose: () => void
}

export function UserEditModal({
  user,
  name,
  email,
  password,
  saving,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSave,
  onClose,
}: UserEditModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Editar Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              ref={firstInputRef}
              id="edit-name"
              type="text"
              value={name}
              onChange={e => onNameChange(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
              <span className="text-gray-400 font-normal ml-1">(dejar vacío para no cambiar)</span>
            </label>
            <input
              id="edit-password"
              type="password"
              value={password}
              onChange={e => onPasswordChange(e.target.value)}
              className="input w-full"
              placeholder="Escribe una nueva contraseña"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary px-4 py-2">Cancelar</button>
          <button onClick={onSave} disabled={saving} className="btn-primary px-4 py-2">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
