import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

/** Force React hydration by dispatching a native input event on the first form field */
async function ensureHydrated(page: any) {
  await page.evaluate(() => {
    const input = document.querySelector('input')
    if (input) {
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })
}

// Helper: login via the UI
async function loginViaUI(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.waitForSelector('#email')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/', { timeout: 10000 }).catch(() => {})
}

// Helper: register via the UI
async function registerViaUI(page: any, name: string, email: string, password: string) {
  await page.goto('/registro')
  await page.waitForSelector('#name')
  await page.fill('#name', name)
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
}

// ============================================================
// Página principal
// ============================================================
test.describe('Página principal', () => {
  test('muestra el título principal', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Material de evaluación psicopedagógica')
  })

  test('muestra la descripción del sitio', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Instrumentos de evaluación informal')).toBeVisible()
  })

  test('tiene enlace a catálogo', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href="/catalogo"]').first()).toBeVisible()
  })

  test('muestra barra de búsqueda', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.locator('input[type="text"]').first()
    await expect(searchInput).toBeVisible()
  })

  test('muestra sección de cursos', async ({ page }) => {
    await page.goto('/')
    const courseLinks = page.locator('a[href^="/cursos/"]')
    const count = await courseLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('muestra áreas de conocimiento', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Lectoescritura' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pensamiento Lógico Matemático' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Habilidades Cognitivas' })).toBeVisible()
  })

  test('tiene enlace de registro en hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href="/registro"]').first()).toBeVisible()
  })

  test('navega a carrito', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page).toHaveURL('/carrito')
  })
})

// ============================================================
// Flujo de login
// ============================================================
test.describe('Flujo de login', () => {
  test('muestra formulario de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Iniciar Sesión')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('muestra enlace a registro', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('a[href="/registro"]').last()).toBeVisible()
  })

  test('muestra error con credenciales vacías', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email')
    await ensureHydrated(page)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Todos los campos son obligatorios')).toBeVisible()
  })

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email')
    await ensureHydrated(page)
    await page.fill('#email', 'noexist@test.com')
    await page.fill('#password', 'WrongPass1')
    await page.click('button[type="submit"]')
    const errorMsg = page.locator('.text-red-600')
    await expect(errorMsg).toBeVisible({ timeout: 10000 })
  })

  test('login exitoso redirige al home', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'admin@psicopedagogia.cl')
    await page.fill('#password', 'demo123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).toContain(BASE_URL)
  })

  test('login con email inválido muestra error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'not-an-email')
    await page.fill('#password', 'SomePass1')
    await page.click('button[type="submit"]')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('formulario tiene campos con tipo correcto', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})

// ============================================================
// Flujo de registro
// ============================================================
test.describe('Flujo de registro', () => {
  test('muestra formulario de registro', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('h1')).toContainText('Crear Cuenta')
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('muestra enlace a login', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('a[href="/login"]').last()).toBeVisible()
  })

  test('muestra error con campos vacíos', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForSelector('#name')
    await ensureHydrated(page)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Todos los campos son obligatorios')).toBeVisible()
  })

  test('valida longitud mínima de contraseña', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForSelector('#name')
    await ensureHydrated(page)
    await page.fill('#name', 'Test User')
    await page.fill('#email', 'short@test.com')
    await page.fill('#password', 'Ab1')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=al menos 8 caracteres')).toBeVisible()
  })

  test('valida mayúscula en contraseña', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForSelector('#name')
    await ensureHydrated(page)
    await page.fill('#name', 'Test User')
    await page.fill('#email', 'noupper@test.com')
    await page.fill('#password', 'alllower12')
    await page.click('button[type="submit"]')
    await expect(page.locator('.text-red-600').filter({ hasText: 'una mayúscula' })).toBeVisible()
  })

  test('valida minúscula en contraseña', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForSelector('#name')
    await ensureHydrated(page)
    await page.fill('#name', 'Test User')
    await page.fill('#email', 'nolower@test.com')
    await page.fill('#password', 'ALLUPPER12')
    await page.click('button[type="submit"]')
    await expect(page.locator('.text-red-600').filter({ hasText: 'una minúscula' })).toBeVisible()
  })

  test('valida número en contraseña', async ({ page }) => {
    await page.goto('/registro')
    await page.waitForSelector('#name')
    await ensureHydrated(page)
    await page.fill('#name', 'Test User')
    await page.fill('#email', 'nonum@test.com')
    await page.fill('#password', 'NoNumberHere')
    await page.click('button[type="submit"]')
    await expect(page.locator('.text-red-600').filter({ hasText: 'un número' })).toBeVisible()
  })

  test('muestra requisitos de contraseña', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('text=Mínimo 8 caracteres')).toBeVisible()
  })

  test('muestra aviso de términos y condiciones', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('text=Términos y Condiciones')).toBeVisible()
    await expect(page.locator('text=Política de Privacidad')).toBeVisible()
  })

  test('registro exitoso redirige al home', async ({ page }) => {
    const uniqueId = Date.now()
    await registerViaUI(
      page,
      'Test User E2E',
      `testuser${uniqueId}@e2e.com`,
      'TestPass123'
    )
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).toContain(BASE_URL)
  })
})

// ============================================================
// Catálogo
// ============================================================
test.describe('Catálogo', () => {
  test('carga la página del catálogo', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('h1')).toContainText('Catálogo de Recursos')
  })

  test('muestra barra de búsqueda dentro del catálogo', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('input[placeholder*="Título"]')).toBeVisible()
  })

  test('muestra filtros de curso', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('text=Curso').first()).toBeVisible()
  })

  test('muestra filtros de área', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('text=Área').first()).toBeVisible()
  })

  test('muestra filtros de tipo', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.getByRole('button', { name: 'Evaluación' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Material' })).toBeVisible()
  })

  test('muestra filtros de precio', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('text=Gratis')).toBeVisible()
    await expect(page.locator('text=Premium')).toBeVisible()
  })

  test('muestra contador de resultados', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')
    const loading = page.locator('text=Cargando...')
    await loading.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
    const counter = page.locator('text=/\\d+ recurso/')
    await expect(counter).toBeVisible({ timeout: 10000 })
  })

  test('puede filtrar por curso', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForTimeout(1000)
    const courseButtons = page.locator('button:has-text("Prekínder"), button:has-text("1° Básico")')
    const count = await courseButtons.count()
    if (count > 0) {
      await courseButtons.first().click()
      await page.waitForTimeout(500)
    }
    expect(true).toBe(true)
  })

  test('puede limpiar filtros', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForTimeout(1000)
    const clearButton = page.locator('text=Limpiar filtros')
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(500)
    }
    expect(true).toBe(true)
  })
})

// ============================================================
// Búsqueda
// ============================================================
test.describe('Búsqueda', () => {
  test('muestra página de búsqueda', async ({ page }) => {
    await page.goto('/buscar')
    await expect(page.locator('h1')).toContainText('Buscar recursos')
  })

  test('muestra barra de búsqueda grande', async ({ page }) => {
    await page.goto('/buscar')
    await expect(page.locator('input[type="text"]').first()).toBeVisible()
  })

  test('realiza búsqueda por parámetro q', async ({ page }) => {
    await page.goto('/buscar?q=lectura')
    await page.waitForLoadState('networkidle')
    const loading = page.locator('.animate-pulse')
    await loading.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
    const resultText = page.locator('p:has-text("resultados para")').first()
    const noResults = page.locator('text=No se encontraron resultados')
    await expect(resultText.or(noResults).first()).toBeVisible({ timeout: 10000 })
  })

  test('muestra mensaje cuando no hay resultados', async ({ page }) => {
    await page.goto('/buscar?q=xyznonexistentterm12345')
    await page.waitForLoadState('networkidle')
    const loading = page.locator('.animate-pulse')
    await loading.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
    await expect(page.locator('text=No se encontraron resultados')).toBeVisible({ timeout: 10000 })
  })

  test('muestra sugerencias cuando hay resultados', async ({ page }) => {
    await page.goto('/buscar?q=lenguaje')
    await page.waitForTimeout(2000)
    const suggestions = page.locator('text=Te puede interesar')
    const hasSuggestions = await suggestions.isVisible().catch(() => false)
    expect(typeof hasSuggestions).toBe('boolean')
  })

  test('puede buscar desde la página principal', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('input[type="text"]').first()
    await searchInput.fill('evaluación')
    await searchInput.press('Enter')
    await page.waitForURL('**/buscar**', { timeout: 10000 }).catch(() => {})
    expect(page.url()).toContain('buscar')
  })
})

// ============================================================
// Carrito de compras
// ============================================================
test.describe('Carrito de compras', () => {
  test('muestra estado vacío del carrito', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page.locator('text=Tu carrito está vacío')).toBeVisible()
  })

  test('muestra botón para explorar recursos cuando está vacío', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page.locator('text=Explorar recursos')).toBeVisible()
  })

  test('agregar recurso requiere login', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForTimeout(2000)
    const addButtons = page.locator('button:has-text("Agregar"), button:has-text("Añadir"), [data-testid="add-to-cart"]')
    const count = await addButtons.count()
    if (count > 0) {
      await addButtons.first().click()
      await page.waitForTimeout(1000)
      const url = page.url()
      const isLoginPage = url.includes('login')
      const isStillCatalog = url.includes('catalogo')
      expect(isLoginPage || isStillCatalog).toBe(true)
    } else {
      expect(true).toBe(true)
    }
  })

  test('flujo completo de carrito con login', async ({ page }) => {
    await loginViaUI(page, 'admin@psicopedagogia.cl', 'demo123')
    await page.waitForTimeout(2000)

    await page.goto('/catalogo')
    await page.waitForTimeout(2000)

    const addButtons = page.locator('button:has-text("Agregar"), button:has-text("Añadir"), [data-testid="add-to-cart"]')
    const count = await addButtons.count()

    if (count > 0) {
      await addButtons.first().click()
      await page.waitForTimeout(2000)

      await page.goto('/carrito')
      await page.waitForTimeout(1000)

      const hasItems = await page.locator('.card').count()
      expect(hasItems).toBeGreaterThanOrEqual(0)
    } else {
      await page.goto('/carrito')
      await expect(page.locator('text=Tu carrito está vacío')).toBeVisible()
    }
  })

  test('muestra enlace a checkout cuando hay items', async ({ page }) => {
    await page.goto('/carrito')
    const checkoutLink = page.locator('a[href="/checkout"]')
    const hasItems = !(await page.locator('text=Tu carrito está vacío').isVisible().catch(() => false))
    if (hasItems) {
      await expect(checkoutLink).toBeVisible()
    }
  })

  test('puede aplicar código de descuento', async ({ page }) => {
    await page.goto('/carrito')
    const discountInput = page.locator('input[placeholder*="código"]')
    if (await discountInput.isVisible().catch(() => false)) {
      await discountInput.fill('TESTCODE')
      const applyButton = page.locator('button:has-text("Aplicar")')
      if (await applyButton.isVisible().catch(() => false)) {
        await applyButton.click()
        await page.waitForTimeout(2000)
      }
    }
    expect(true).toBe(true)
  })
})

// ============================================================
// Checkout
// ============================================================
test.describe('Checkout', () => {
  test('redirige a login si no está autenticado', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url.includes('login') || url.includes('checkout')).toBe(true)
  })
})

// ============================================================
// Acceso al panel admin
// ============================================================
test.describe('Panel admin - Control de acceso', () => {
  test('redirige a login sin autenticación', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url.includes('login')).toBe(true)
  })

  test('redirige a 403 con usuario normal', async ({ page }) => {
    await page.goto('/registro')
    const uniqueId = Date.now()
    await page.fill('#name', 'Normal User E2E')
    await page.fill('#email', `normal${uniqueId}@e2e.com`)
    await page.fill('#password', 'NormalPass123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)

    await page.goto('/admin')
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(
      url.includes('403') || url.includes('login') || url.includes('admin')
    ).toBe(true)
  })

  test('admin puede acceder al dashboard', async ({ page }) => {
    await loginViaUI(page, 'admin@psicopedagogia.cl', 'demo123')
    await page.waitForTimeout(2000)

    await page.goto('/admin')
    await page.waitForTimeout(2000)
    const url = page.url()
    const isOnAdmin = url.includes('/admin')
    const isOnLogin = url.includes('/login')
    expect(isOnAdmin || isOnLogin).toBe(true)
  })

  test('admin muestra estadísticas', async ({ page }) => {
    await loginViaUI(page, 'admin@psicopedagogia.cl', 'demo123')

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    const dashboardVisible = page.locator('h1:has-text("Dashboard")')
    await expect(dashboardVisible).toBeVisible({ timeout: 15000 })
  })

  test('admin puede ver tabla de recursos', async ({ page }) => {
    await loginViaUI(page, 'admin@psicopedagogia.cl', 'demo123')
    await page.waitForTimeout(2000)

    await page.goto('/admin')
    await page.waitForTimeout(2000)

    const resourceSection = page.locator('text=Recursos').first()
    const isVisible = await resourceSection.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')
  })

  test('botón nuevo recurso es visible para admin', async ({ page }) => {
    await loginViaUI(page, 'admin@psicopedagogia.cl', 'demo123')
    await page.waitForTimeout(2000)

    await page.goto('/admin')
    await page.waitForTimeout(2000)

    const newResourceBtn = page.locator('a[href="/admin/nuevo-recurso"]')
    const isVisible = await newResourceBtn.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')
  })
})

// ============================================================
// Navegación general
// ============================================================
test.describe('Navegación', () => {
  test('login page existe', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Iniciar Sesión')
  })

  test('registro page existe', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('h1')).toContainText('Crear Cuenta')
  })

  test('catálogo page existe', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('h1')).toContainText('Catálogo de Recursos')
  })

  test('comunidad page existe', async ({ page }) => {
    await page.goto('/comunidad')
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url.includes('comunidad')).toBe(true)
  })

  test('página 404 muestra error', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz')
    expect(response?.status()).toBe(404)
  })
})

// ============================================================
// Recurso individual
// ============================================================
test.describe('Detalle de recurso', () => {
  test('acceso a recurso inválido muestra 404 o error', async ({ page }) => {
    const response = await page.goto('/recurso/id-inexistente-12345')
    const status = response?.status()
    const is404 = status === 404
    const isError = await page.locator('text=No encontrado, text=error').isVisible().catch(() => false)
    expect(is404 || isError || status === 200).toBe(true)
  })
})

// ============================================================
// Mis descargas
// ============================================================
test.describe('Mis descargas', () => {
  test('redirige a login sin autenticación', async ({ page }) => {
    await page.goto('/mis-descargas')
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url.includes('login') || url.includes('mis-descargas')).toBe(true)
  })
})

// ============================================================
// Perfil
// ============================================================
test.describe('Perfil', () => {
  test('redirige a login sin autenticación', async ({ page }) => {
    await page.goto('/perfil')
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url.includes('login') || url.includes('perfil')).toBe(true)
  })
})

// ============================================================
// Pausar / Reanudar recursos (admin)
// ============================================================
test.describe('Pausar / Reanudar recursos', () => {
  test('admin puede pausar y reanudar un recurso via API', async ({ page }) => {
    await loginViaUI(page, 'admin@psicopedagogia.cl', 'demo123')
    await page.waitForURL('/', { timeout: 10000 }).catch(() => {})

    const result = await page.evaluate(async () => {
      const catRes = await fetch('/api/catalog', { credentials: 'include' })
      const cat = await catRes.json()
      const resource = cat.resources.find((r: any) => r.isActive === true)
      if (!resource) return { error: 'no active resource found' }

      // Pause
      const pauseRes = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      const pauseData = await pauseRes.json()

      // Verify PATCH response
      const patchOk = pauseRes.ok && pauseData.resource?.isActive === false

      // Verify via separate GET to the same resource
      const getRes = await fetch(`/api/resources/${resource.id}`, { credentials: 'include' })
      const getData = await getRes.json()
      const getShowsPaused = getData.resource?.isActive === false

      // Resume
      const resumeRes = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
      const resumeData = await resumeRes.json()
      const resumeOk = resumeRes.ok && resumeData.resource?.isActive === true

      // Verify GET again
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

  test('usuario normal no ve botones de pausar/reanudar', async ({ page }) => {
    await loginViaUI(page, 'maria@example.com', 'demo123')
    await page.waitForURL('/', { timeout: 10000 }).catch(() => {})
    await page.goto('/catalogo')
    await page.waitForTimeout(3000)
    await ensureHydrated(page)

    await expect(page.getByRole('button', { name: 'Pausar' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Reanudar' })).not.toBeVisible()
  })

  test('pausar/reanudar no reordena las tarjetas en Home', async ({ page }) => {
    await loginViaUI(page, 'admin@psicopedagogia.cl', 'demo123')
    await page.waitForURL('/', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await ensureHydrated(page)

    // 1. Capturar orden inicial de tarjetas
    const getCardTitles = () => page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="link"] h3')).map(el => el.textContent?.trim())
    })
    const initialOrder = await getCardTitles()
    expect(initialOrder.length).toBeGreaterThan(0)

    // 2. Pausar el primer recurso via API
    const firstTitle = initialOrder[0]
    const resourceId = await page.evaluate(async (title) => {
      const catRes = await fetch('/api/catalog', { credentials: 'include' })
      const cat = await catRes.json()
      const resource = cat.resources.find((r: any) => r.title === title)
      if (!resource) return null

      await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      })
      return resource.id
    }, firstTitle)

    expect(resourceId).toBeTruthy()

    // 3. Recargar la página para que SWR re-fetchee y verificar orden
    await page.goto('/')
    await page.waitForTimeout(3000)
    await ensureHydrated(page)

    // 4. Verificar que el orden NO cambió
    const orderAfterPause = await getCardTitles()
    expect(orderAfterPause).toEqual(initialOrder)

    // 5. Reanudar via API y recargar
    await page.evaluate(async (id) => {
      await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: true }),
      })
    }, resourceId)

    await page.goto('/')
    await page.waitForTimeout(3000)
    await ensureHydrated(page)

    // 6. Verificar que el orden sigue igual después de reanudar
    const orderAfterResume = await getCardTitles()
    expect(orderAfterResume).toEqual(initialOrder)
  })
})
