// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { ResourcePriceSection } from '@/components/ResourcePriceSection'
import type { Resource } from '@/lib/interfaces'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({ user: null }),
}))

vi.mock('@/lib/utils', () => ({
  formatClp: (v: number) => `$${v.toLocaleString('es-CL')}`,
  hasActivePromo: (r: Resource) => r.promoFreeUntil ? new Date(r.promoFreeUntil) > new Date() : false,
}))

vi.mock('@/components/ResourcePausedBanner', () => ({
  ResourcePausedBanner: () => <div data-testid="paused-banner">Recurso en pausa</div>,
}))

import { useAuth } from '@/context/AuthContext'

const baseResource: Resource = {
  id: 'r1',
  title: 'Test Resource',
  description: 'Test description',
  filePath: '/pdfs/r1.pdf',
  previewPath: '/previews/placeholder.svg',
  resourceType: 'evaluation',
  isFree: true,
  priceClp: null,
  promoFreeUntil: null,
  courseId: 1,
  areaId: 1,
  subareaId: null,
  downloadsCount: 0,
  isActive: true,
  courseName: 'Prekínder',
  areaName: 'Lectoescritura',
  tags: ['tag1', 'tag2'],
}

describe('ResourcePriceSection', () => {
  const mockOnDownload = vi.fn()
  const mockOnAddToCart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ user: null } as any)
  })

  describe('free resources', () => {
    it('renders "Gratuito" label for free resources', () => {
      render(
        <ResourcePriceSection
          resource={baseResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getAllByText('Gratis').length).toBeGreaterThanOrEqual(1)
    })

    it('renders download button for free resources', () => {
      render(
        <ResourcePriceSection
          resource={baseResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('Descargar PDF')).toBeInTheDocument()
    })

    it('calls onDownload when download button is clicked', () => {
      render(
        <ResourcePriceSection
          resource={baseResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      fireEvent.click(screen.getByText('Descargar PDF'))
      expect(mockOnDownload).toHaveBeenCalled()
    })
  })

  describe('paid resources', () => {
    const paidResource: Resource = {
      ...baseResource,
      isFree: false,
      priceClp: 5990,
    }

    it('renders formatted price for paid resources', () => {
      render(
        <ResourcePriceSection
          resource={paidResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('$5.990')).toBeInTheDocument()
    })

    it('renders "Agregar al carrito" button for paid resources', () => {
      render(
        <ResourcePriceSection
          resource={paidResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('Agregar al carrito')).toBeInTheDocument()
    })

    it('calls onAddToCart when add to cart button is clicked', () => {
      render(
        <ResourcePriceSection
          resource={paidResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      fireEvent.click(screen.getByText('Agregar al carrito'))
      expect(mockOnAddToCart).toHaveBeenCalled()
    })
  })

  describe('promo resources', () => {
    it('renders "Gratis por tiempo limitado" for active promo', () => {
      const promoResource: Resource = {
        ...baseResource,
        isFree: false,
        priceClp: 5990,
        promoFreeUntil: new Date(Date.now() + 86400000).toISOString(),
      }
      render(
        <ResourcePriceSection
          resource={promoResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('Promoción')).toBeInTheDocument()
    })

    it('renders download button for promo resources', () => {
      const promoResource: Resource = {
        ...baseResource,
        isFree: false,
        priceClp: 5990,
        promoFreeUntil: new Date(Date.now() + 86400000).toISOString(),
      }
      render(
        <ResourcePriceSection
          resource={promoResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('Descargar PDF')).toBeInTheDocument()
    })
  })

  describe('owned resources', () => {
    it('renders "Ya comprado" message for owned resources', () => {
      const ownedResource: Resource = {
        ...baseResource,
        isFree: false,
        priceClp: 5990,
        isOwned: true,
      }
      render(
        <ResourcePriceSection
          resource={ownedResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('Ya tienes acceso vitalicio a este recurso')).toBeInTheDocument()
    })

    it('renders download button for owned resources', () => {
      const ownedResource: Resource = {
        ...baseResource,
        isFree: false,
        priceClp: 5990,
        isOwned: true,
      }
      render(
        <ResourcePriceSection
          resource={ownedResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('Descargar PDF')).toBeInTheDocument()
    })
  })

  describe('paused state', () => {
    it('renders paused banner when resource is inactive', () => {
      const pausedResource: Resource = {
        ...baseResource,
        isActive: false,
      }
      render(
        <ResourcePriceSection
          resource={pausedResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByTestId('paused-banner')).toBeInTheDocument()
    })

    it('does not render download button when paused', () => {
      const pausedResource: Resource = {
        ...baseResource,
        isActive: false,
      }
      render(
        <ResourcePriceSection
          resource={pausedResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.queryByText('Descargar PDF')).toBeNull()
    })
  })

  describe('cart state', () => {
    const paidResource: Resource = {
      ...baseResource,
      isFree: false,
      priceClp: 5990,
    }

    it('shows "Ir al carrito" link when addedToCart is true', () => {
      render(
        <ResourcePriceSection
          resource={paidResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={true}
        />
      )
      expect(screen.getByText('Ir al carrito')).toBeInTheDocument()
    })

    it('shows "Agregado al carrito" confirmation when addedToCart is true', () => {
      render(
        <ResourcePriceSection
          resource={paidResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={true}
        />
      )
      expect(screen.getByText('Agregado al carrito')).toBeInTheDocument()
    })
  })

  describe('downloading state', () => {
    it('shows "Descargando..." when downloading is true', () => {
      render(
        <ResourcePriceSection
          resource={baseResource}
          downloading={true}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText('Descargando...')).toBeInTheDocument()
    })

    it('disables download button when downloading', () => {
      render(
        <ResourcePriceSection
          resource={baseResource}
          downloading={true}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      const button = screen.getByText('Descargando...').closest('button')
      expect(button).toBeDisabled()
    })
  })

  describe('not logged in', () => {
    it('shows login prompt when not logged in', () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as any)
      render(
        <ResourcePriceSection
          resource={baseResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.getByText(/Inicia sesión para/)).toBeInTheDocument()
    })

    it('does not show login prompt when logged in', () => {
      vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1', name: 'Test', email: 'test@test.com', role: 'user' } } as any)
      render(
        <ResourcePriceSection
          resource={baseResource}
          downloading={false}
          onDownload={mockOnDownload}
          onAddToCart={mockOnAddToCart}
          addedToCart={false}
        />
      )
      expect(screen.queryByText(/Inicia sesión para/)).toBeNull()
    })
  })
})
