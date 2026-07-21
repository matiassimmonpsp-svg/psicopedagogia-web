// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { ResourceCard } from '@/components/ResourceCard'
import type { Resource } from '@/lib/interfaces'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}))

vi.mock('next/navigation', () => {
  const push = vi.fn()
  return { useRouter: vi.fn(() => ({ push })) }
})

vi.mock('next/image', () => ({
  default: (props: any) =>
    React.createElement('img', { src: props.src, alt: props.alt }),
}))

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({ user: null }),
}))

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { render, screen, fireEvent } from '@testing-library/react'

const baseResource: Resource = {
  id: 'r1',
  title: 'Test Resource',
  description: 'A test description for this resource',
  filePath: '/pdfs/r1.pdf',
  previewPath: '/previews/placeholder.svg',
  resourceType: 'evaluation',
  isFree: true,
  priceClp: null,
  promoFreeUntil: null,
  courseId: 1,
  areaId: 1,
  subareaId: null,
  downloadsCount: 42,
  isActive: true,
  courseName: 'Prekínder',
  areaName: 'Lectoescritura',
  tags: ['tag1', 'tag2', 'tag3'],
}

const adminUser = { id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' }

describe('ResourceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ user: null } as any)
  })

  describe('rendering', () => {
    it('renders resource title', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('Test Resource')).toBeInTheDocument()
    })

    it('renders resource description', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('A test description for this resource')).toBeInTheDocument()
    })

    it('renders course name', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('Prekínder')).toBeInTheDocument()
    })

    it('renders download count', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('navigates to resource detail on card click', () => {
      render(<ResourceCard resource={baseResource} />)
      const card = screen.getByRole('link')
      expect(card).toHaveAttribute('href', '/recurso/r1')
      card.click()
    })
  })

  describe('badges and pricing', () => {
    it('renders "Gratis" badge for free resources', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('Gratis')).toBeInTheDocument()
    })

    it('renders "Premium" badge for paid resources', () => {
      const paid = { ...baseResource, isFree: false, priceClp: 5990 }
      render(<ResourceCard resource={paid} />)
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    it('renders formatted price for paid resources', () => {
      const paid = { ...baseResource, isFree: false, priceClp: 5990 }
      render(<ResourceCard resource={paid} />)
      expect(screen.getByText('$5.990')).toBeInTheDocument()
    })

    it('renders "Gratuito" for free resources', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('Gratuito')).toBeInTheDocument()
    })

    it('renders "Promo" badge when promo is active', () => {
      const promo = {
        ...baseResource,
        promoFreeUntil: new Date(Date.now() + 86400000).toISOString(),
      }
      render(<ResourceCard resource={promo} />)
      const promoBadges = screen.getAllByText('Promo')
      expect(promoBadges.length).toBeGreaterThanOrEqual(1)
    })

    it('does not render promo badge when promo is expired', () => {
      const expired = {
        ...baseResource,
        promoFreeUntil: new Date(Date.now() - 86400000).toISOString(),
      }
      render(<ResourceCard resource={expired} />)
      expect(screen.queryByText('Promo')).toBeNull()
    })
  })

  describe('tags', () => {
    it('renders up to 3 tags', () => {
      const withTags = { ...baseResource, tags: ['a', 'b', 'c', 'd'] }
      render(<ResourceCard resource={withTags} />)
      expect(screen.getByText('a')).toBeInTheDocument()
      expect(screen.getByText('b')).toBeInTheDocument()
      expect(screen.getByText('c')).toBeInTheDocument()
      expect(screen.queryByText('d')).toBeNull()
    })

    it('renders fewer tags when less than 3', () => {
      const few = { ...baseResource, tags: ['only-one'] }
      render(<ResourceCard resource={few} />)
      expect(screen.getByText('only-one')).toBeInTheDocument()
    })

    it('renders no tags when array is empty', () => {
      const none = { ...baseResource, tags: [] }
      render(<ResourceCard resource={none} />)
      expect(screen.queryByText('tag1')).toBeNull()
    })
  })

  describe('paused state', () => {
    it('shows "En pausa" overlay when isActive is false and user is admin', () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      const paused = { ...baseResource, isActive: false }
      render(<ResourceCard resource={paused} />)
      expect(screen.getByText('En pausa')).toBeInTheDocument()
    })

    it('does not show "En pausa" badge for non-admin even when paused', () => {
      const paused = { ...baseResource, isActive: false }
      render(<ResourceCard resource={paused} />)
      expect(screen.queryByText('En pausa')).toBeNull()
    })

    it('does not show "En pausa" when isActive is true', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.queryByText('En pausa')).toBeNull()
    })

    it('applies opacity when paused', () => {
      const paused = { ...baseResource, isActive: false }
      const { container } = render(<ResourceCard resource={paused} />)
      const divs = container.querySelectorAll('div')
      const contentDiv = Array.from(divs).find(d =>
        d.className.includes('p-4') && d.className.includes('opacity-40')
      )
      expect(contentDiv).toBeDefined()
      expect(contentDiv!.className).toContain('opacity-40')
    })
  })

  describe('resource type labels', () => {
    it('renders "Evaluación" for evaluation resources', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('Evaluación')).toBeInTheDocument()
    })

    it('renders "Material" for educational resources', () => {
      const edu = { ...baseResource, resourceType: 'educational' as const }
      render(<ResourceCard resource={edu} />)
      expect(screen.getByText('Material')).toBeInTheDocument()
    })
  })

  describe('admin controls', () => {
    it('shows admin buttons when user is admin', () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      render(<ResourceCard resource={baseResource} />)
      expect(screen.getByText('Editar')).toBeInTheDocument()
      expect(screen.getByText('Pausar')).toBeInTheDocument()
      expect(screen.getByText('Eliminar')).toBeInTheDocument()
    })

    it('does not show admin buttons for regular users', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { ...adminUser, role: 'user' },
      } as any)
      render(<ResourceCard resource={baseResource} />)
      expect(screen.queryByText('Editar')).toBeNull()
      expect(screen.queryByText('Pausar')).toBeNull()
      expect(screen.queryByText('Eliminar')).toBeNull()
    })

    it('does not show admin buttons when not logged in', () => {
      render(<ResourceCard resource={baseResource} />)
      expect(screen.queryByText('Editar')).toBeNull()
    })

    it('shows "Reanudar" for paused resources when admin', () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      const paused = { ...baseResource, isActive: false }
      render(<ResourceCard resource={paused} />)
      expect(screen.getByText('Reanudar')).toBeInTheDocument()
    })
  })

  describe('handleToggleActive', () => {
    it('calls PATCH /api/resources/[id] on toggle', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'test-token' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ resource: { id: 'r1', isActive: false } }) })
      globalThis.fetch = mockFetch

      render(<ResourceCard resource={baseResource} />)
      fireEvent.click(screen.getByText('Pausar'))

      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/resources/r1', expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isActive: false }),
        }))
      })
    })

    it('shows "Recurso pausado" toast when deactivating', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ resource: { id: 'r1', isActive: false } }) })

      render(<ResourceCard resource={baseResource} />)
      fireEvent.click(screen.getByText('Pausar'))

      await vi.waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Recurso pausado')
      })
    })

    it('shows "Recurso reanudado" toast when resuming', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ resource: { id: 'r1', isActive: true } }) })
      const paused = { ...baseResource, isActive: false }

      render(<ResourceCard resource={paused} />)
      fireEvent.click(screen.getByText('Reanudar'))

      await vi.waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Recurso reanudado')
      })
    })

    it('calls onUpdate after successful toggle', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      const onUpdate = vi.fn()
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ resource: { id: 'r1', isActive: false } }) })

      render(<ResourceCard resource={baseResource} onUpdate={onUpdate} />)
      fireEvent.click(screen.getByText('Pausar'))

      await vi.waitFor(() => {
        expect(onUpdate).toHaveBeenCalled()
      })
    })

    it('shows error toast when server returns invalid response', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })

      render(<ResourceCard resource={baseResource} />)
      fireEvent.click(screen.getByText('Pausar'))

      await vi.waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Respuesta inválida del servidor')
      })
    })

    it('shows toast error on fetch failure', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network'))

      render(<ResourceCard resource={baseResource} />)
      fireEvent.click(screen.getByText('Pausar'))

      await vi.waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network')
      })
    })
  })

  describe('handleDelete', () => {
    it('calls DELETE /api/resources/[id] after confirmation', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'test-token' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      globalThis.fetch = mockFetch

      render(<ResourceCard resource={baseResource} />)
      fireEvent.click(screen.getByText('Eliminar'))

      await vi.waitFor(() => {
        expect(screen.getByText('Eliminar recurso')).toBeInTheDocument()
      })

      const confirmBtn = screen.getAllByText('Eliminar').find(el => el.tagName === 'BUTTON' && el.closest('[role="dialog"]'))
      fireEvent.click(confirmBtn!)

      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/resources/r1', expect.objectContaining({
          method: 'DELETE',
        }))
      })
    })

    it('does not delete when confirmation is cancelled', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: adminUser } as any)
      globalThis.fetch = vi.fn()

      render(<ResourceCard resource={baseResource} />)
      fireEvent.click(screen.getByText('Eliminar'))

      await vi.waitFor(() => {
        expect(screen.getByText('Eliminar recurso')).toBeInTheDocument()
      })

      const cancelBtn = screen.getByText('Cancelar')
      fireEvent.click(cancelBtn)

      await vi.waitFor(() => {
        expect(globalThis.fetch).not.toHaveBeenCalled()
      })
    })
  })
})
