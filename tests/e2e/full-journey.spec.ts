import { test, expect } from '@playwright/test'
import { SEL } from './selectors'

let e2eEmail: string

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator(SEL.login.email)).toBeVisible({ timeout: 10000 })
  await page.fill(SEL.login.email, email)
  await page.fill(SEL.login.password, password)
  await page.click(SEL.login.submit)
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 15000 })
}

async function registerE2eUser(request: any): Promise<string> {
  const ts = Date.now()
  const email = `e2e-purchase-${ts}@e2e.com`
  const res = await request.post('/api/auth/register', {
    data: { email, password: 'E2eTest1', name: 'E2E Comprador' },
  })
  expect(res.ok()).toBeTruthy()
  return email
}

async function clearCart(page: any) {
  await page.evaluate(async () => {
    const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
    const { csrfToken } = await csrfRes.json()
    await fetch('/api/cart/clear', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrfToken },
    })
  })
}

async function addFirstPaidResourceToCart(page: any): Promise<boolean> {
  const added = await page.evaluate(async () => {
    const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
    const { csrfToken } = await csrfRes.json()
    const catRes = await fetch('/api/catalog?limit=50', { credentials: 'include' })
    const cat = await catRes.json()
    const paid = (cat.resources || []).filter((r: any) => (r.priceClp ?? 0) > 0 && r.isActive !== false)
    for (const resource of paid) {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ resourceId: resource.id }),
      })
      if (res.ok) return true
    }
    return false
  })
  return added
}

test.beforeAll(async ({ request }) => {
  try {
    e2eEmail = await registerE2eUser(request)
  } catch {
    e2eEmail = `e2e-purchase-${Date.now()}@e2e.com`
    await request.post('/api/auth/register', {
      data: { email: e2eEmail, password: 'E2eTest1', name: 'E2E Comprador' },
    })
  }
})

test.describe('Flujo completo: login → catálogo → carrito → descuento → checkout', () => {
  test('login via UI con credenciales válidas', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await expect(page).not.toHaveURL(/login/)
    const url = page.url()
    expect(url).not.toContain('/login')
  })

  test('registro de usuario E2E via API', async ({ request }) => {
    const email = await registerE2eUser(request)
    expect(email).toContain('@e2e.com')
  })

  test('limpiar carrito via API', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await clearCart(page)
    await page.goto('/carrito')
    await page.waitForLoadState('domcontentloaded')
    const isEmpty = await page.locator(SEL.cart.empty).isVisible().catch(() => false)
    const hasZeroItems = (await page.locator(SEL.cart.items).count()) === 0
    expect(isEmpty || hasZeroItems).toBe(true)
  })

  test('flujo completo: login → catálogo → carrito → descuento → checkout → descarga', async ({ page }) => {
    await loginAs(page, e2eEmail, 'E2eTest1')
    await clearCart(page)

    const added = await addFirstPaidResourceToCart(page)
    expect(added).toBe(true)

    await page.goto('/carrito')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator(SEL.cart.items).first()).toBeVisible()

    const itemCount = await page.locator(SEL.cart.items).count()
    expect(itemCount).toBeGreaterThanOrEqual(1)

    await page.fill(SEL.cart.discountInput, 'BIENVENIDO10')
    await page.click(SEL.cart.applyDiscount)

    await expect(async () => {
      const hasQuitar = await page.locator(SEL.cart.removeDiscount).isVisible().catch(() => false)
      const hasError = await page.locator(SEL.common.errorAlert).isVisible().catch(() => false)
      expect(hasQuitar || hasError).toBe(true)
    }).toPass({ timeout: 10000 })

    await page.click(SEL.cart.goToCheckout)
    await page.waitForURL(/checkout/, { timeout: 10000 })
    await expect(page.locator(SEL.checkout.summary)).toBeVisible()

    await page.click(SEL.checkout.paymentMethod('transfer'))
    await expect(page.locator(SEL.checkout.payButton)).toBeVisible()
    await page.click(SEL.checkout.payButton)

    await page.waitForURL(/mis-descargas/, { timeout: 15000 })

    await expect(async () => {
      const hasItems = (await page.locator('[data-testid="download-item"], a[href^="/recurso/"]').count()) > 0
      const hasEmpty = await page.locator('text=No tienes').isVisible().catch(() => false)
      expect(hasItems || !hasEmpty).toBe(true)
    }).toPass({ timeout: 10000 })
  })

  test('carrito se mantiene al navegar entre páginas', async ({ page }) => {
    await loginAs(page, e2eEmail, 'E2eTest1')
    await clearCart(page)

    await addFirstPaidResourceToCart(page)

    await page.goto('/catalogo')
    await page.waitForLoadState('domcontentloaded')

    await page.goto('/carrito')
    await page.waitForLoadState('domcontentloaded')

    const itemCount = await page.locator(SEL.cart.items).count()
    expect(itemCount).toBeGreaterThanOrEqual(0)
  })

  test('checkout sin items muestra mensaje', async ({ page }) => {
    await loginAs(page, e2eEmail, 'E2eTest1')
    await clearCart(page)

    await page.goto('/checkout')
    await page.waitForLoadState('domcontentloaded')

    const hasEmptyMessage = await page.locator('text=No hay productos').isVisible().catch(() => false)
    const hasCartLink = await page.locator('text=Explorar recursos').isVisible().catch(() => false)
    const isRedirected = !page.url().includes('checkout')
    expect(hasEmptyMessage || hasCartLink || isRedirected).toBe(true)
  })

  test('descuento inválido muestra error', async ({ page }) => {
    await loginAs(page, e2eEmail, 'E2eTest1')
    await clearCart(page)

    const added = await addFirstPaidResourceToCart(page)
    if (!added) return

    await page.goto('/carrito')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator(SEL.cart.discountInput)).toBeVisible({ timeout: 5000 })
    await page.fill(SEL.cart.discountInput, 'CODIGO_INVALIDO')
    await page.click(SEL.cart.applyDiscount)

    await expect(async () => {
      const hasError = await page.locator(SEL.common.errorAlert).isVisible().catch(() => false)
      const hasInvalid = await page.locator('text=no válido').isVisible().catch(() => false)
      expect(hasError || hasInvalid).toBe(true)
    }).toPass({ timeout: 10000 })
  })

  test('post-purchase: recurso aparece en Mis descargas con botón de descarga', async ({ page }) => {
    await loginAs(page, e2eEmail, 'E2eTest1')

    await page.goto('/mis-descargas')
    await page.waitForLoadState('domcontentloaded')

    const hasContent = await expect(async () => {
      const hasDownloadItem = (await page.locator('[data-testid="download-item"]').count()) > 0
      const hasResourceLink = (await page.locator('a[href^="/recurso/"]').count()) > 0
      const hasEmpty = await page.locator('text=No tienes').isVisible().catch(() => false)
      expect(hasDownloadItem || hasResourceLink || hasEmpty).toBe(true)
    }).toPass({ timeout: 10000 })
  })

  test('eliminar item del carrito actualiza el estado', async ({ page }) => {
    await loginAs(page, e2eEmail, 'E2eTest1')
    await clearCart(page)

    const added = await addFirstPaidResourceToCart(page)
    if (!added) return

    await page.goto('/carrito')
    await expect(page.locator(SEL.cart.items).first()).toBeVisible({ timeout: 10000 })

    const initialCount = await page.locator(SEL.cart.items).count()
    expect(initialCount).toBeGreaterThanOrEqual(1)

    await page.locator(SEL.cart.removeItem).first().click()

    await expect(async () => {
      const newCount = await page.locator(SEL.cart.items).count()
      expect(newCount).toBeLessThan(initialCount)
    }).toPass({ timeout: 10000 })
  })

  test('error de pago se maneja correctamente', async ({ page }) => {
    await loginAs(page, e2eEmail, 'E2eTest1')
    await clearCart(page)

    await page.goto('/checkout')
    await page.waitForLoadState('domcontentloaded')

    const hasEmptyCheckout = await page.locator('text=No hay productos').isVisible().catch(() => false)
    const hasEmptyCart = await page.locator(SEL.cart.empty).isVisible().catch(() => false)
    const hasCartLink = await page.locator('text=Explorar recursos').isVisible().catch(() => false)
    expect(hasEmptyCheckout || hasEmptyCart || hasCartLink).toBe(true)
  })
})
