# Psicopedagogía Web

Plataforma de marketplace de instrumentos de evaluación psicopedagógica para profesionales de la educación en Chile. Ofrece un catálogo de recursos de evaluación informal, carrito de compras, sistema de descargas, panel administrativo y comunidad integrada.

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Estilos | Tailwind CSS + Lucide React |
| Autenticación | JWT (jose) + bcryptjs |
| Datos en cliente | SWR |
| Notificaciones | react-hot-toast |
| Tests unitarios | Vitest |
| Tests E2E | Playwright |

## Requisitos previos

- **Node.js** 20 o superior
- **PostgreSQL** 14 o superior
- **npm** (o pnpm/yarn)

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd psychopedagogy-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus datos de PostgreSQL y JWT_SECRET

# 4. Generar cliente Prisma
npx prisma generate

# 5. Aplicar esquema a la base de datos
npm run db:push

# 6. Cargar datos iniciales
npm run db:seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm start` | Iniciar servidor de producción |
| `npm run lint` | Linting con ESLint |
| `npm run db:push` | Aplicar esquema Prisma a la BD |
| `npm run db:seed` | Cargar datos iniciales (cursos, áreas, recursos) |
| `npm run db:studio` | Abrir Prisma Studio (GUI de BD) |
| `npm test` | Tests unitarios (utils + data + DB) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:all` | Todos los tests unitarios |
| `npm run test:api` | Tests de API (inicia servidor automáticamente) |
| `npm run test:e2e` | Tests E2E con Playwright |

## Estructura del proyecto

```
psychopedagogy-web/
├── prisma/
│   ├── schema.prisma        # Esquema de la base de datos
│   └── seed.ts              # Script de seed
├── public/
│   └── uploads/previews/    # Imágenes de portada de recursos
├── src/
│   ├── app/
│   │   ├── api/             # API routes (REST)
│   │   │   ├── auth/        # login, register, me, logout
│   │   │   ├── catalog/     # Catálogo de recursos
│   │   │   ├── cart/        # Gestión del carrito
│   │   │   ├── checkout/    # Proceso de pago
│   │   │   ├── resources/   # CRUD de recursos
│   │   │   ├── users/       # Gestión de usuarios
│   │   │   ├── downloads/   # Registro de descargas
│   │   │   ├── discount-codes/ # Códigos de descuento
│   │   │   └── instagram/   # Integration con Instagram
│   │   ├── admin/           # Panel administrador
│   │   │   ├── recursos/
│   │   │   ├── usuarios/
│   │   │   ├── descuentos/
│   │   │   └── nuevo-recurso/
│   │   ├── catalogo/        # Catálogo público
│   │   ├── buscar/          # Búsqueda de recursos
│   │   ├── carrito/         # Carrito de compras
│   │   ├── checkout/        # Finalizar compra
│   │   ├── cursos/          # Páginas por curso
│   │   ├── recurso/[id]/    # Detalle de recurso
│   │   ├── login/           # Inicio de sesión
│   │   ├── registro/        # Crear cuenta
│   │   ├── mis-descargas/   # Descargas del usuario
│   │   ├── perfil/          # Perfil de usuario
│   │   ├── comunidad/       # Posts de Instagram
│   │   ├── material-educativo/ # Material educativo
│   │   ├── 401/             # Página no autorizada
│   │   └── 403/             # Acceso denegado
│   ├── components/          # Componentes React reutilizables
│   ├── context/             # Context providers (Auth, Cart)
│   ├── lib/                 # Utilidades, hooks, mock data
│   └── middleware.ts        # Middleware de seguridad y auth
├── tests/
│   ├── e2e/                 # Tests E2E (Playwright)
│   ├── api.test.ts          # Tests de API
│   ├── data.test.ts         # Tests de datos mock
│   ├── db.test.ts           # Tests de base de datos
│   └── utils.test.ts        # Tests de utilidades
├── .env.example             # Template de variables de entorno
├── playwright.config.ts     # Configuración de Playwright
├── tailwind.config.ts       # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
└── vitest.config.ts         # Configuración de Vitest
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/psicopedagogia_dev?schema=public` |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio | `http://localhost:3000` |
| `NEXT_PUBLIC_INSTAGRAM_USER` | Usuario de Instagram para la comunidad | `siimon.psp` |
| `INSTAGRAM_ACCESS_TOKEN` | Token de acceso a la API de Instagram | `tu-token-aqui` |
| `INSTAGRAM_USER_ID` | ID del usuario de Instagram | `@siimon.psp` |
| `JWT_SECRET` | Secreto para firmar tokens JWT (mínimo 32 caracteres) | `cadena-secreta-aleatoria-larga` |

> **Importante:** Nunca commitees el archivo `.env` al repositorio. Usa `.env.example` como referencia.

## Rutas principales

| Ruta | Descripción | Auth |
|---|---|---|
| `/` | Landing page con búsqueda y cursos | No |
| `/catalogo` | Catálogo completo con filtros | No |
| `/buscar?q=...` | Búsqueda de recursos | No |
| `/recurso/[id]` | Detalle de un recurso | No |
| `/cursos/[slug]` | Recursos por curso | No |
| `/material-educativo` | Material educativo | No |
| `/comunidad` | Posts de Instagram | No |
| `/login` | Inicio de sesión | No |
| `/registro` | Crear cuenta | No |
| `/carrito` | Carrito de compras | Sí |
| `/checkout` | Finalizar compra | Sí |
| `/mis-descargas` | Descargas del usuario | Sí |
| `/perfil` | Perfil de usuario | Sí |
| `/admin` | Panel administrador | Admin |

## Base de datos

El esquema Prisma define las siguientes tablas principales:

- **User** — Usuarios con roles (`user` | `admin`)
- **Course** — Cursos (Prekínder a 8° Básico)
- **Area** — Áreas (Lectoescritura, Matemáticas, Cognitivo)
- **Subarea** — Subáreas dentro de cada área
- **Resource** — Recursos de evaluación/material educativo
- **Tag** — Etiquetas para categorización
- **Order** / **OrderItem** — Órdenes de compra y sus items
- **Download** — Registro de descargas por usuario
- **DiscountCode** — Códigos de descuento
- **SocialPost** — Posts de Instagram (mock o real)

## Tests

### Tests unitarios

```bash
npm test            # Ejecuta utils, data y DB tests
npm run test:all    # Todos los tests unitarios
```

### Tests de API

```bash
npm run test:api    # Inicia servidor y ejecuta tests contra la API
```

### Tests E2E

```bash
npx playwright install chromium   # Instalar navegador (primera vez)
npm run test:e2e                  # Ejecutar tests E2E
```

Los tests E2E cubren:
- Página principal y navegación
- Flujo de login y registro
- Catálogo y búsqueda
- Flujo del carrito de compras
- Control de acceso al panel admin

## Despliegue

### Vercel (recomendado)

1. Conectar el repositorio a Vercel
2. Configurar variables de entorno en el dashboard
3. Configurar la base de datos PostgreSQL (Vercel Postgres, Neon, Supabase, etc.)
4. Ejecutar `npx prisma db push` y `npm run db:seed` una vez en producción

### Docker

```bash
docker build -t psicopedagogia-web .
docker run -p 3000:3000 --env-file .env psicopedagogia-web
```

### Consideraciones de producción

- Asegurar que `JWT_SECRET` sea una cadena aleatoria de al menos 32 caracteres
- Configurar un dominio y SSL para `NEXT_PUBLIC_SITE_URL`
- Usar un servicio de archivos para uploads (S3, Cloudinary, etc.)
- Configurar CORS si se accede desde dominios externos
- Monitorear el rendimiento de las queries de Prisma con `prisma generate`
