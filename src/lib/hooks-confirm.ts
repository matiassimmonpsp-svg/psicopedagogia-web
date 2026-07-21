'use client'

import { useState, useCallback } from 'react'

interface ConfirmState {
  open: boolean
  title: string
  message: string
  action: (() => void) | null
}

/**
 * Hook reutilizable para diálogos de confirmación.
 * Reemplaza el patrón duplicado de showConfirm en páginas admin.
 */
export function useConfirmDialog() {
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false, title: '', message: '', action: null,
  })

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirm({ open: true, title, message, action: onConfirm })
  }, [])

  const handleConfirm = useCallback(() => {
    confirm.action?.()
    setConfirm({ open: false, title: '', message: '', action: null })
  }, [confirm.action])

  const handleCancel = useCallback(() => {
    setConfirm({ open: false, title: '', message: '', action: null })
  }, [])

  return { ...confirm, showConfirm, handleConfirm, handleCancel }
}
