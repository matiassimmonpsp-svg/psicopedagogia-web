# Psicopedagogía Web

Portal de recursos psicopedagógicos con catálogo, carrito de compras, sistema de descargas, panel admin y comunidad.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Base de datos:** SQLite (Prisma ORM)
- **Autenticación:** JWT + bcrypt
- **Estilos:** Tailwind CSS + Lucide icons
- **Tests:** Vitest (unitarios/integración), Playwright (E2E)

## Requisitos

- Node.js 20+
- npm

## Instalación

```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
```

## Desarrollo

```bash
npm run dev
```

## Tests

```bash
# Tests unitarios (utils + data mock + DB)
npm test

# Tests con cobertura
npm run test:all

# Tests de API (inicia servidor automáticamente)
npm run test:api

# Tests E2E (Playwright)
npx playwright install chromium
npm run test:e2e
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build producción |
| `npm test` | Tests unitarios + DB |
| `npm run test:api` | Tests de API |
| `npm run test:e2e` | Tests E2E |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seed de BD |

## Rutas principales

- `/` — Landing page
- `/catalogo` — Catálogo completo
- `/buscar` — Búsqueda
- `/recurso/[id]` — Detalle de recurso
- `/carrito` — Carrito de compras
- `/checkout` — Finalizar compra
- `/login` / `/registro` — Auth
- `/mis-descargas` — Descargas del usuario
- `/admin` — Panel administrador
- `/comunidad` — Posts de Instagram
