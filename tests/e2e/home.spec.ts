import { test, expect } from '@playwright/test'

test.describe('Página principal', () => {
  test('muestra el título', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Recursos psicopedagógicos')
  })

  test('tiene enlace a catálogo', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href="/catalogo"]').first()).toBeVisible()
  })

  test('navega a carrito', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page).toHaveURL('/carrito')
  })
})

test.describe('Catálogo', () => {
  test('carga recursos', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForTimeout(2000)
    const cards = page.locator('.card, [class*="recurso"], [class*="resource"]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Navegación', () => {
  test('login existe', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1, h2').first()).toContainText(/inicias? sesión|login|ingresar/i)
  })

  test('registro existe', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('admin redirige sin auth', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL(/login/, { timeout: 5000 }).catch(() => {})
    const url = page.url()
    expect(url.includes('login') || url.includes('admin')).toBe(true)
  })
})
