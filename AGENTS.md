# Agent Instructions

## Testing Policy

**Siempre que se haga un cambio grande (5+ archivos, refactors, fixes de seguridad, nueva funcionalidad):**

1. **Correr todos los tests** (`npx vitest run`) al finalizar
2. **Crear tests nuevos** para la funcionalidad agregada (rutas API, componentes, lógica de negocio)
3. **Actualizar tests existentes** que se rompan por los cambios (adaptar mocks, assertions, textos)
4. **Verificar TypeScript** (`npx tsc --noEmit`) — 0 errores antes de dar por terminado
5. **No entregar sin tests pasando** — si hay tests fallando, arreglarlos antes de continuar

## Communication Style

**IMPORTANTE: El usuario es un novato que está aprendiendo. SIEMPRE explicar así:**

1. **Primero el análisis profesional** (técnico, con términos correctos)
2. **Después la explicación fácil** — como si se lo explicara a alguien que recién empieza
3. **Siempre con un ejemplo concreto** — código real o analogía del mundo real
4. **Evitar siglas sin explicar** — si digo "CSRF", explicar qué significa
5. **Chileno español** — confianza, directo, sin rodeos
6. **Si el usuario pregunta "qué es X"**, explicar primero el concepto general antes de entrar en detalles técnicos

Ejemplo de cómo responder:
```
## Análisis técnico
CSRF double-submit cookie en src/lib/csrf.ts protege contra ataques cross-site.

## En fácil
Imagina que tienes una llave maestra (la cookie CSRF). Cada vez que haces
una petición importante (como cambiar tu contraseña), el servidor verifica
que traigas esa llave. Si alguien desde otro sitio intenta hacerlo por ti,
no tiene la llave y el servidor lo rechaza.
```

## Project Conventions

- Chilean Spanish for all user-facing text and explanations
- Dev server runs on port 3001
- PostgreSQL 16, Prisma ORM
- Seed users: `admin@psicopedagogia.cl`/`Demo1234` (admin), `maria@example.com`/`Demo1234` (user), `d.menesesp@live.com`/`Test1234` (user)
- E2E `globalTeardown.ts` cleans up `@e2e.com` users
- PowerShell: use `cmd /c "cd /d ... && ..."` for chained commands (no `&&` in PS)
- Node.js v24.18.0; CI uses Node 20 LTS
