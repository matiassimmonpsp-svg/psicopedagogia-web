import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { SEL } from './selectors'

const ADMIN_EMAIL = 'admin@psicopedagogia.cl'
const ADMIN_PASSWORD = 'Demo1234'

function createTestPdf(tmpDir: string): string {
  const pdfPath = path.join(tmpDir, 'test-resource.pdf')
  const pdf = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
  )
  fs.writeFileSync(pdfPath, pdf)
  return pdfPath
}

function createTestPng(tmpDir: string): string {
  const pngPath = path.join(tmpDir, 'test-preview.png')
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ])
  fs.writeFileSync(pngPath, png)
  return pngPath
}

async function loginAsAdmin(page: any) {
  await page.context().clearCookies()
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill(SEL.login.email, ADMIN_EMAIL)
  await page.fill(SEL.login.password, ADMIN_PASSWORD)
  await page.click(SEL.login.submit)
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 15000 })
}

async function goToStep2(page: any) {
  await page.selectOption(SEL.resourceForm.courseSelect, '13')
  await expect(async () => {
    const isDisabled = await page.locator(SEL.resourceForm.areaSelect).getAttribute('disabled')
    expect(isDisabled).toBeNull()
  }).toPass({ timeout: 5000 })

  await page.selectOption(SEL.resourceForm.areaSelect, '4')
  await expect(async () => {
    const isDisabled = await page.locator(SEL.resourceForm.subareaSelect).getAttribute('disabled')
    expect(isDisabled).toBeNull()
  }).toPass({ timeout: 5000 })

  await page.click('button:has-text("Continuar")')
  await expect(page.locator('h2:has-text("Título y descripción")')).toBeVisible()
}

test.describe('Admin: crear recurso completo (flujo real)', () => {
  const tmpDir = path.join(process.cwd(), 'tmp-e2e')
  let pdfPath: string
  let pngPath: string

  test.beforeAll(async () => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    pdfPath = createTestPdf(tmpDir)
    pngPath = createTestPng(tmpDir)
  })

  test.afterAll(async () => {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true })
  })

  test('paso 1: seleccionar tipo, curso y área', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/nuevo-recurso')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h2:has-text("Tipo de material")')).toBeVisible()

    await page.selectOption(SEL.resourceForm.courseSelect, '13')
    await expect(async () => {
      const isDisabled = await page.locator(SEL.resourceForm.areaSelect).getAttribute('disabled')
      expect(isDisabled).toBeNull()
    }).toPass({ timeout: 5000 })

    await page.selectOption(SEL.resourceForm.areaSelect, '4')
    await expect(page.locator(SEL.resourceForm.subareaSelect)).toBeEnabled()

    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Título y descripción")')).toBeVisible()
  })

  test('paso 2: escribir título y tags', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/nuevo-recurso')
    await page.waitForLoadState('networkidle')

    await goToStep2(page)

    await expect(page.locator(SEL.resourceForm.titleInput)).toBeVisible()
    await page.fill(SEL.resourceForm.titleInput, 'Evaluación de Comprensión Lectora E2E')

    await page.fill(SEL.resourceForm.descriptionInput, 'Prueba E2E de creación de recurso')

    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Precio")')).toBeVisible()
  })

  test('paso 3: precio gratuito (default)', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/nuevo-recurso')
    await page.waitForLoadState('networkidle')

    await goToStep2(page)

    await page.fill(SEL.resourceForm.titleInput, 'E2E Precio Test')
    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Precio")')).toBeVisible()

    await expect(page.getByRole('radio', { name: 'Gratuito' })).toBeVisible()
    await expect(page.locator('text=Este recurso estará disponible gratuitamente')).toBeVisible()

    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Material para descargar")')).toBeVisible()
  })

  test('paso 4: subir PDF e imagen de portada', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/nuevo-recurso')
    await page.waitForLoadState('networkidle')

    await goToStep2(page)

    await page.fill(SEL.resourceForm.titleInput, 'E2E Upload Test')
    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Precio")')).toBeVisible()

    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Material para descargar")')).toBeVisible()

    const pdfInput = page.locator('input[type="file"][accept=".pdf"]')
    await pdfInput.setInputFiles(pdfPath)
    await expect(page.locator('text=test-resource.pdf')).toBeVisible({ timeout: 10000 })

    const previewInput = page.locator('input[type="file"][accept="image/*"]')
    await previewInput.setInputFiles(pngPath)
    await expect(page.locator('img[alt="Preview"]')).toBeVisible({ timeout: 10000 })

    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Revisa antes de publicar")')).toBeVisible()
  })

  test('flujo completo: crear recurso y verificar que aparece', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/nuevo-recurso')
    await page.waitForLoadState('networkidle')

    const uniqueTitle = `E2E recurso ${Date.now()}`

    await goToStep2(page)

    await page.fill(SEL.resourceForm.titleInput, uniqueTitle)
    await page.fill(SEL.resourceForm.descriptionInput, 'Recurso creado por test E2E completo')
    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Precio")')).toBeVisible()

    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Material para descargar")')).toBeVisible()

    const pdfInput = page.locator('input[type="file"][accept=".pdf"]')
    await pdfInput.setInputFiles(pdfPath)
    await expect(page.locator('text=test-resource.pdf')).toBeVisible({ timeout: 10000 })

    const previewInput = page.locator('input[type="file"][accept="image/*"]')
    await previewInput.setInputFiles(pngPath)
    await expect(page.locator('img[alt="Preview"]')).toBeVisible({ timeout: 10000 })

    await page.click('button:has-text("Continuar")')
    await expect(page.locator('h2:has-text("Revisa antes de publicar")')).toBeVisible()

    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible()

    const publishBtn = page.locator('button:has-text("Publicar recurso")')
    await expect(publishBtn).toBeVisible()
    await publishBtn.click()

    await page.waitForResponse(
      res => res.url().includes('/api/resources') && res.request().method() === 'POST',
      { timeout: 30000 }
    ).catch(() => {})

    await expect(async () => {
      const isOnResourcePage = page.url().includes('/recurso/')
      const hasSuccessMessage = await page.locator('text=Recurso creado exitosamente').isVisible().catch(() => false)
      expect(isOnResourcePage || hasSuccessMessage).toBe(true)
    }).toPass({ timeout: 15000 })
  })

  test('tags aparecen como sugerencias según curso y área', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/nuevo-recurso')
    await page.waitForLoadState('networkidle')

    await goToStep2(page)

    await expect(page.locator('text=Sugerencias para este curso y área')).toBeVisible({ timeout: 5000 })

    await expect(page.locator('button:has-text("fluidez lectora")')).toBeVisible()
    await expect(page.locator('button:has-text("comprensión lectora")')).toBeVisible()
    await expect(page.locator('button:has-text("vocabulario")')).toBeVisible()

    await page.click('button:has-text("fluidez lectora")')
    await expect(page.locator('span:has-text("fluidez lectora")')).toBeVisible()
  })

  test('subida de archivos falla sin CSRF (verificar protección)', async ({ page }) => {
    await loginAsAdmin(page)

    const response = await page.evaluate(async () => {
      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }))
      formData.append('type', 'pdf')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      return { status: res.status, ok: res.ok }
    })

    expect(response.status).toBe(403)
  })
})
