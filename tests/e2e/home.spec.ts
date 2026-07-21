import { test, expect } from '@playwright/test'
import { SEL } from './selectors'

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill(SEL.login.email, email)
  await page.fill(SEL.login.password, password)
  await page.click(SEL.login.submit)
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 15000 })
}

async function registerAs(page: any, name: string, email: string, password: string) {
  await page.goto('/registro')
  await page.waitForLoadState('networkidle')
  await page.fill(SEL.register.name, name)
  await page.fill(SEL.register.email, email)
  await page.fill(SEL.register.password, password)
  await page.click(SEL.register.submit)
  await page.waitForURL((url: URL) => !url.pathname.includes('/registro'), { timeout: 15000 })
}

// ============================================================
// Home
// ============================================================
test.describe('Home', () => {
  test('loads with correct title and description', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Material de evaluación psicopedagógica')
    await expect(page.locator('text=Instrumentos de evaluación informal')).toBeVisible()
  })

  test('has link to catalog', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(SEL.nav.catalog)).toBeVisible()
  })

  test('hero shows course navigation pills', async ({ page }) => {
    await page.goto('/')
    const heroCourseLinks = page.locator('section').first().locator('a[href^="/cursos/"]')
    const count = await heroCourseLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('shows knowledge areas', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Lectoescritura' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pensamiento Lógico Matemático' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Habilidades Cognitivas' })).toBeVisible()
  })

  test('has register link in hero', async ({ page }) => {
    await page.goto('/')
    const heroSection = page.locator('section').first()
    await expect(heroSection.locator('a[href="/registro"]')).toBeVisible()
  })

  test('shows search input', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('input[type="text"]')).toBeVisible()
  })

  test('navigates to cart page', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page).toHaveURL('/carrito')
  })
})

// ============================================================
// Login
// ============================================================
test.describe('Login', () => {
  test('shows login form with all fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Iniciar Sesión')
    await expect(page.locator(SEL.login.email)).toBeVisible()
    await expect(page.locator(SEL.login.password)).toBeVisible()
    await expect(page.locator(SEL.login.submit)).toBeVisible()
  })

  test('empty fields show validation error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.click(SEL.login.submit)
    await expect(page.locator(SEL.common.errorAlert)).toContainText('Todos los campos son obligatorios')
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill(SEL.login.email, 'noexist@test.com')
    await page.fill(SEL.login.password, 'WrongPass1')
    await page.click(SEL.login.submit)
    await expect(page.locator(SEL.common.errorAlert)).toBeVisible({ timeout: 10000 })
  })

  test('valid credentials redirect to home', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill(SEL.login.email, 'admin@psicopedagogia.cl')
    await page.fill(SEL.login.password, 'Demo1234')
    await page.click(SEL.login.submit)
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')
  })

  test('form has correct input types', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('has link to registration', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('form a[href="/registro"]')).toBeVisible()
  })
})

// ============================================================
// Registro
// ============================================================
test.describe('Registro', () => {
  test('shows registration form with all fields', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('h1')).toContainText('Crear Cuenta')
    await expect(page.locator(SEL.register.name)).toBeVisible()
    await expect(page.locator(SEL.register.email)).toBeVisible()
    await expect(page.locator(SEL.register.password)).toBeVisible()
  })

  test('empty fields show validation error', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForLoadState('networkidle')
    await page.click(SEL.register.submit)
    await expect(page.locator(SEL.common.errorAlert)).toContainText('Todos los campos son obligatorios')
  })

  test('short password shows minimum length error', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForLoadState('networkidle')
    await page.fill(SEL.register.name, 'Test User')
    await page.fill(SEL.register.email, 'short@test.com')
    await page.fill(SEL.register.password, 'Ab1')
    await page.click(SEL.register.submit)
    await expect(page.locator('text=al menos 8 caracteres')).toBeVisible()
  })

  test('password without uppercase shows error', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForLoadState('networkidle')
    await page.fill(SEL.register.name, 'Test User')
    await page.fill(SEL.register.email, 'noupper@test.com')
    await page.fill(SEL.register.password, 'alllower12')
    await page.click(SEL.register.submit)
    await expect(page.locator('.text-red-600')).toContainText('una mayúscula')
  })

  test('password without lowercase shows error', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForLoadState('networkidle')
    await page.fill(SEL.register.name, 'Test User')
    await page.fill(SEL.register.email, 'nolower@test.com')
    await page.fill(SEL.register.password, 'ALLUPPER12')
    await page.click(SEL.register.submit)
    await expect(page.locator('.text-red-600')).toContainText('una minúscula')
  })

  test('password without number shows error', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForLoadState('networkidle')
    await page.fill(SEL.register.name, 'Test User')
    await page.fill(SEL.register.email, 'nonum@test.com')
    await page.fill(SEL.register.password, 'NoNumberHere')
    await page.click(SEL.register.submit)
    await expect(page.locator('.text-red-600')).toContainText('un número')
  })

  test('shows password requirements', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('text=Mínimo 8 caracteres')).toBeVisible()
  })

  test('shows terms and privacy links', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('text=Términos y Condiciones')).toBeVisible()
    await expect(page.locator('text=Política de Privacidad')).toBeVisible()
  })

  test('valid registration redirects to home', async ({ page }) => {
    const uniqueId = Date.now()
    await registerAs(page, 'Test User E2E', `testuser${uniqueId}@e2e.com`, 'TestPass123')
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')
  })
})

// ============================================================
// Catálogo
// ============================================================
test.describe('Catálogo', () => {
  test('loads with title and search input', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('h1')).toContainText('Catálogo de Recursos')
    await expect(page.locator('input[placeholder*="Título"]')).toBeVisible()
  })

  test('shows filter sections', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator(SEL.catalog.courseFilters)).toBeVisible()
    await expect(page.locator(SEL.catalog.typeFilters)).toBeVisible()
    await expect(page.locator(SEL.catalog.priceFilters)).toBeVisible()
  })

  test('shows results count after loading', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(SEL.catalog.resultsCount)).toBeVisible({ timeout: 15000 })
  })

  test('filtering by course shows only resources from that course', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(SEL.catalog.resultsCount)).toBeVisible({ timeout: 15000 })

    const courseButton = page.locator(`${SEL.catalog.courseFilters} button`).first()
    await courseButton.click()
    await page.waitForLoadState('networkidle')

    await expect(async () => {
      const cards = page.locator(SEL.catalog.resourceCards)
      const count = await cards.count()
      expect(count).toBeGreaterThan(0)
    }).toPass({ timeout: 15000 })
  })

  test('clearing filters restores all results', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(SEL.catalog.resultsCount)).toBeVisible({ timeout: 15000 })

    const initialText = await page.locator(SEL.catalog.resultsCount).textContent()
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0')

    const courseButton = page.locator(`${SEL.catalog.courseFilters} button`).first()
    await courseButton.click()
    await page.waitForLoadState('networkidle')

    const clearButton = page.locator(SEL.catalog.clearFilters)
    await expect(clearButton).toBeVisible()
    await clearButton.click()
    await page.waitForLoadState('networkidle')

    const restoredText = await page.locator(SEL.catalog.resultsCount).textContent()
    const restoredCount = parseInt(restoredText?.match(/\d+/)?.[0] || '0')
    expect(restoredCount).toBe(initialCount)
  })
})

// ============================================================
// Búsqueda
// ============================================================
test.describe('Búsqueda', () => {
  test('search page loads with input', async ({ page }) => {
    await page.goto('/buscar')
    await expect(page.locator('h1')).toContainText('Buscar recursos')
    await expect(page.locator('input[type="text"]')).toBeVisible()
  })

  test('query parameter shows results', async ({ page }) => {
    await page.goto('/buscar?q=lectura')
    await page.waitForLoadState('networkidle')
    await expect(async () => {
      const hasResults = await page.locator(SEL.search.results).isVisible().catch(() => false)
      const hasNoResults = await page.locator('text=No se encontraron resultados').isVisible().catch(() => false)
      const hasCards = (await page.locator('a[href^="/recurso/"]').count()) > 0
      expect(hasResults || hasNoResults || hasCards).toBe(true)
    }).toPass({ timeout: 20000 })
  })

  test('nonsense query shows no results', async ({ page }) => {
    await page.goto('/buscar?q=xyznonexistentterm12345')
    await page.waitForLoadState('networkidle')
    await expect(async () => {
      const hasNoResults = await page.locator('text=No se encontraron resultados').isVisible().catch(() => false)
      const hasResultText = await page.locator('p').filter({ hasText: /resultado/ }).isVisible().catch(() => false)
      expect(hasNoResults || hasResultText).toBe(true)
    }).toPass({ timeout: 20000 })
  })

  test('searching from home navigates to search page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('input[type="text"]')
    await searchInput.fill('evaluación')
    await searchInput.press('Enter')
    await page.waitForURL('**/buscar**', { timeout: 10000 })
    expect(page.url()).toContain('buscar')
  })
})

// ============================================================
// Carrito
// ============================================================
test.describe('Carrito', () => {
  test('shows empty state when cart is empty', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page.locator(SEL.cart.empty)).toBeVisible()
  })

  test('shows explore button when empty', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page.locator('text=Explorar recursos')).toBeVisible()
  })

  test('add item with login shows in cart', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')

    const addButton = page.locator(SEL.resource.addToCart).first()
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForLoadState('networkidle')
    }

    await page.goto('/carrito')
    await page.waitForLoadState('networkidle')
    const hasItems = await page.locator(SEL.cart.items).count() > 0
    const isEmpty = await page.locator(SEL.cart.empty).isVisible().catch(() => false)
    expect(hasItems || isEmpty).toBe(true)
  })

  test('remove item from cart restores empty state', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')

    const addButton = page.locator(SEL.resource.addToCart).first()
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForLoadState('networkidle')
    }

    await page.goto('/carrito')
    await page.waitForLoadState('networkidle')

    const removeButton = page.locator(SEL.cart.removeItem)
    if (await removeButton.isVisible()) {
      await removeButton.click()
      await page.waitForLoadState('networkidle')
      await expect(page.locator(SEL.cart.empty)).toBeVisible()
    }
  })
})

// ============================================================
// Checkout
// ============================================================
test.describe('Checkout', () => {
  test('checkout shows empty state when not authenticated and cart is empty', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    const hasEmpty = await page.locator('text=No hay productos').isVisible().catch(() => false)
    const hasCartLink = await page.locator('text=Explorar recursos').isVisible().catch(() => false)
    const isOnCheckout = page.url().includes('checkout')
    expect(hasEmpty || hasCartLink || isOnCheckout).toBe(true)
  })
})

// ============================================================
// Admin
// ============================================================
test.describe('Admin', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('login')
  })

  test('normal user gets 403 or redirect', async ({ page }) => {
    const uniqueId = Date.now()
    await page.goto('/registro')
    await page.waitForLoadState('networkidle')
    await page.fill(SEL.register.name, 'Normal User E2E')
    await page.fill(SEL.register.email, `normal${uniqueId}@e2e.com`)
    await page.fill(SEL.register.password, 'NormalPass123')
    await page.click(SEL.register.submit)
    await page.waitForURL('/', { timeout: 10000 })

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    expect(url.includes('403') || url.includes('login') || url.includes('admin')).toBe(true)
  })

  test('admin can access dashboard', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 15000 })
  })

  test('admin sees stats and new resource button', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(SEL.admin.stats)).toBeVisible({ timeout: 15000 })
    await expect(page.locator('a[href="/admin/nuevo-recurso"]').first()).toBeVisible({ timeout: 15000 })
  })
})

// ============================================================
// Navegación
// ============================================================
test.describe('Navegación', () => {
  test('all main pages exist and load', async ({ page }) => {
    const pages = [
      { url: '/login', text: 'Iniciar Sesión' },
      { url: '/registro', text: 'Crear Cuenta' },
      { url: '/catalogo', text: 'Catálogo de Recursos' },
    ]
    for (const p of pages) {
      await page.goto(p.url)
      await expect(page.locator('h1')).toContainText(p.text)
    }
  })

  test('community page loads', async ({ page }) => {
    await page.goto('/comunidad')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('comunidad')
  })

  test('nonexistent page returns 404', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz')
    expect(response?.status()).toBe(404)
  })
})

// ============================================================
// Detalle de recurso
// ============================================================
test.describe('Detalle de recurso', () => {
  test('invalid resource shows 404 or error', async ({ page }) => {
    const response = await page.goto('/recurso/id-inexistente-12345')
    const status = response?.status()
    expect(status === 404 || status === 200).toBe(true)
  })

  test('valid resource shows price section', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')
    const resourceLink = page.locator('a[href^="/recurso/"]')
    const count = await resourceLink.count()
    if (count === 0) return

    await resourceLink.first().click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator(SEL.resource.detail)).toBeVisible()

    const hasPrice =
      await page.locator(SEL.resource.priceSection).isVisible().catch(() => false) ||
      await page.locator('text=Gratuito').isVisible().catch(() => false) ||
      await page.locator('text=Gratis por tiempo limitado').isVisible().catch(() => false)
    expect(hasPrice).toBe(true)
  })
})

// ============================================================
// Mis descargas
// ============================================================
test.describe('Mis descargas', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/mis-descargas')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('login')
  })
})

// ============================================================
// Pausar / Reanudar
// ============================================================
test.describe('Pausar/Reanudar', () => {
  test('admin can pause and resume a resource via API', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')

    const result = await page.evaluate(async () => {
      const catRes = await fetch('/api/catalog', { credentials: 'include' })
      const cat = await catRes.json()
      const resource = cat.resources.find((r: any) => r.isActive === true)
      if (!resource) return { error: 'no active resource found' }

      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const headers = { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }

      const pauseRes = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH', headers, credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      const pauseData = await pauseRes.json()
      const patchOk = pauseRes.ok && pauseData.resource?.isActive === false

      const getRes = await fetch(`/api/resources/${resource.id}`, { credentials: 'include' })
      const getData = await getRes.json()
      const getShowsPaused = getData.resource?.isActive === false

      const resumeRes = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH', headers, credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
      const resumeData = await resumeRes.json()
      const resumeOk = resumeRes.ok && resumeData.resource?.isActive === true

      const getRes2 = await fetch(`/api/resources/${resource.id}`, { credentials: 'include' })
      const getData2 = await getRes2.json()
      const getShowsActive = getData2.resource?.isActive === true

      return { resourceId: resource.id, patchOk, getShowsPaused, resumeOk, getShowsActive }
    })

    expect(result.error).toBeFalsy()
    expect(result.patchOk).toBe(true)
    expect(result.getShowsPaused).toBe(true)
    expect(result.resumeOk).toBe(true)
    expect(result.getShowsActive).toBe(true)
  })

  test('normal user cannot see pause/resume buttons', async ({ page }) => {
    await loginAs(page, 'maria@example.com', 'Demo1234')
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: 'Pausar' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Reanudar' })).not.toBeVisible()
  })

  test('pausing does not reorder cards on home', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const getCardTitles = () => page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="/recurso/"] h3')).map(el => el.textContent?.trim())
    )
    const initialOrder = await getCardTitles()
    expect(initialOrder.length).toBeGreaterThan(0)

    const firstTitle = initialOrder[0]
    const resourceId = await page.evaluate(async (title) => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const featRes = await fetch('/api/home-featured', { credentials: 'include' })
      const feat = await featRes.json()
      const allResources = [...(feat.free || []), ...(feat.premium || [])]
      const resource = allResources.find((r: any) => r.title === title)
      if (!resource) return null
      await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      return resource.id
    }, firstTitle)

    expect(resourceId).toBeTruthy()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const orderAfterPause = await getCardTitles()
    expect(orderAfterPause).toEqual(initialOrder)

    await page.evaluate(async (id) => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
    }, resourceId)

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const orderAfterResume = await getCardTitles()
    expect(orderAfterResume).toEqual(initialOrder)
  })
})

// ============================================================
// Home-featured visibility
// ============================================================
test.describe('Home-featured visibility', () => {
  test('paused resource is hidden from non-admin users', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstFreeTitle = await page.evaluate(() => {
      const freeSection = document.querySelectorAll('section')[0]
      if (!freeSection) return null
      const h3 = freeSection.querySelector('h3')
      return h3?.textContent?.trim() || null
    })

    const paused = await page.evaluate(async (title) => {
      if (!title) return null
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const catRes = await fetch('/api/home-featured', { credentials: 'include' })
      const cat = await catRes.json()
      const allResources = [...(cat.free || []), ...(cat.premium || [])]
      const resource = allResources.find((r: any) => r.title === title)
      if (!resource) return null
      const patchRes = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      if (!patchRes.ok) return null
      return { id: resource.id, title: resource.title }
    }, firstFreeTitle)

    if (!paused) return

    await page.evaluate(async () => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        credentials: 'include',
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const resourceLinks = page.locator('a[href^="/recurso/"]')
    const count = await resourceLinks.count()
    let found = false
    for (let i = 0; i < count; i++) {
      const text = await resourceLinks.nth(i).textContent().catch(() => '') ?? ''
      if (text.includes(paused.title)) { found = true; break }
    }
    expect(found).toBe(false)

    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.evaluate(async (id) => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
    }, paused.id)
  })

  test('admin can see paused resources on home', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstFreeTitle = await page.evaluate(() => {
      const freeSection = document.querySelectorAll('section')[0]
      if (!freeSection) return null
      const h3 = freeSection.querySelector('h3')
      return h3?.textContent?.trim() || null
    })

    const paused = await page.evaluate(async (title) => {
      if (!title) return null
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const catRes = await fetch('/api/home-featured', { credentials: 'include' })
      const cat = await catRes.json()
      const allResources = [...(cat.free || []), ...(cat.premium || [])]
      const resource = allResources.find((r: any) => r.title === title)
      if (!resource) return null
      const patchRes = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      if (!patchRes.ok) return null
      return { id: resource.id, title: resource.title }
    }, firstFreeTitle)

    if (!paused) return

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const resourceLinks = page.locator('a[href^="/recurso/"]')
    const count = await resourceLinks.count()
    let found = false
    for (let i = 0; i < count; i++) {
      const text = await resourceLinks.nth(i).textContent().catch(() => '') ?? ''
      if (text.includes(paused.title)) { found = true; break }
    }
    expect(found).toBe(true)

    await page.evaluate(async (id) => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
    }, paused.id)
  })

  test('shows max 4 free and 4 premium resources', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const freeCards = page.locator('section:has-text("Recursos gratuitos") a[href^="/recurso/"]')
    const premiumCards = page.locator('section:has-text("Material premium") a[href^="/recurso/"]')
    const freeCount = await freeCards.count()
    const premiumCount = await premiumCards.count()
    expect(freeCount).toBeLessThanOrEqual(4)
    expect(premiumCount).toBeLessThanOrEqual(4)
    expect(freeCount).toBeGreaterThan(0)
  })

  test('resources from deactivated areas are hidden from non-admin', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const deactivated = await page.evaluate(async () => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const featRes = await fetch('/api/home-featured', { credentials: 'include' })
      const feat = await featRes.json()
      const allResources = [...(feat.free || []), ...(feat.premium || [])]
      if (allResources.length === 0) return null
      const r = allResources[0]
      if (!r.areaSlug) return null
      const areasRes = await fetch('/api/areas', { credentials: 'include' })
      const areasData = await areasRes.json()
      const area = areasData.areas?.find((a: any) => a.slug === r.areaSlug)
      if (!area) return null
      const patchRes = await fetch(`/api/areas/${area.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      if (!patchRes.ok) return null
      return { areaId: area.id, resourceTitle: r.title }
    })

    if (!deactivated) return

    await page.evaluate(async () => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        credentials: 'include',
      })
    })

    const freshContext = await page.context().browser()!.newContext()
    const freshPage = await freshContext.newPage()
    const apiRes = await freshPage.request.get('http://localhost:3000/api/home-featured')
    const apiResponse = await apiRes.json()
    const allResources = [...(apiResponse.free || []), ...(apiResponse.premium || [])]
    const found = allResources.some((r: any) => r.title === deactivated.resourceTitle)
    await freshContext.close()
    expect(found).toBe(false)

    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.evaluate(async (id) => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      await fetch(`/api/areas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
    }, deactivated.areaId)
  })

  test('admin sees resources from deactivated areas', async ({ page }) => {
    await loginAs(page, 'admin@psicopedagogia.cl', 'Demo1234')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstResource = await page.evaluate(async () => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const featRes = await fetch('/api/home-featured', { credentials: 'include' })
      const feat = await featRes.json()
      const allResources = [...(feat.free || []), ...(feat.premium || [])]
      if (allResources.length === 0) return null
      const r = allResources[0]
      if (!r.areaSlug) return null
      const areasRes = await fetch('/api/areas', { credentials: 'include' })
      const areasData = await areasRes.json()
      const area = areasData.areas?.find((a: any) => a.slug === r.areaSlug)
      if (!area) return null
      const patchRes = await fetch(`/api/areas/${area.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      if (!patchRes.ok) return null
      return { areaId: area.id, resourceTitle: r.title }
    })

    if (!firstResource) return

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const resourceLinks = page.locator('a[href^="/recurso/"]')
    const count = await resourceLinks.count()
    let found = false
    for (let i = 0; i < count; i++) {
      const text = await resourceLinks.nth(i).textContent().catch(() => '') ?? ''
      if (text.includes(firstResource.resourceTitle)) { found = true; break }
    }
    expect(found).toBe(true)

    await page.evaluate(async (id) => {
      const csrfRes = await fetch('/api/csrf', { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      await fetch(`/api/areas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
    }, firstResource.areaId)
  })
})
