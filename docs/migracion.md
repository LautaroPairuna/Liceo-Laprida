# Migración a Next.js + NestJS

Objetivo: pasar el SPA de Vite (todo en `localStorage`) a un monorepo `apps/web` (Next.js 16) + `apps/api` (NestJS 12 sobre Fastify) con Prisma 7 + PostgreSQL 17, siguiendo `stack-lautaro` e `infra-lautaro`.
Rama: `dev`. Tests: Vitest (`npm test -w apps/api`, `npm test -w apps/web`).

## Specs

- **S1** — "tenemos que pasar este proyecto a mi stack de Next y Nest, recuerda seguir las practicas que tenemos configuradas en infra-lautaro y stack-lautaro"
- **S2** — "Realmente tienen un sistema llamado plataforma educativa, donde los usuarios pueden tener sus cursos con su usuario, cuando compren los cursos, tendrian que de alguna forma darles acceso a esa plataforma. Aun no tenemos la api pero dejemos todo sedimentando"
  - Implementación: puerto `EducationPlatform` en la API + adaptador `pending` que deja la inscripción en `ACCESS_PENDING`; el alta corre en una cola BullMQ disparada por el pago aprobado.
- **S3** — Mercado Pago "iria real": Orders API, webhook con firma validada, procesamiento idempotente en cola, consulta del recurso real antes de aprobar.
- **S4** (supuesto) — Se conservan rutas, diseño y textos actuales: `/`, `/cursos`, `/cursos/[id]`, `/alumnos`, `/contacto`, `/inscripcion`, `/admin/*`.
- **S5** (supuesto) — El admin deja de usar la contraseña fija `"123"`: login con Better Auth (email + contraseña), montado en la API.
- **S6** (supuesto) — Compra como invitado (sin cuenta de alumno en este sitio); la cuenta del alumno vive en la plataforma educativa.
- **S7** (supuesto) — El seed carga cursos, contenido e institución desde los datos actuales; las inscripciones de ejemplo solo en desarrollo.

## Decisiones

- D1 — Nest justificado por cola persistente (pagos + alta en plataforma) y API consumible por la plataforma (criterios de `route-handlers.md`).
- D2 — Next reescribe `/api/*` hacia la API: mismo origen, cookies de Better Auth en el dominio del sitio, sin CORS.
- D3 — Prisma fijado en 7.10.1 (`latest` de npm es `8.0.0-rc`). TypeScript 6 fijado en `apps/api`.
- D4 — Dos servicios en Dokploy (`railpack.web.json`, `railpack.api.json`), Redis de colas con `noeviction`.
- D5 — Las migraciones en producción no corren al arrancar: decisión pendiente (ver `stack-lautaro`, "Casos que la plantilla no cubre").

## Tasks

| #   | Spec   | Tarea                                                                                          | Estado    | Commit |
| --- | ------ | ---------------------------------------------------------------------------------------------- | --------- | ------ |
| T1  | S1     | Monorepo: npm workspaces, Biome, legacy movido a `legacy/`, esqueletos `apps/web` y `apps/api` | hecho     |        |
| T2  | S1, S7 | API: schema Prisma + seed desde los datos actuales                                             | pendiente |        |
| T3  | S1, S4 | API: endpoints públicos (cursos, contenido, institución)                                       | pendiente |        |
| T4  | S4     | Web: páginas públicas en RSC                                                                   | pendiente |        |
| T5  | S5     | API: Better Auth + endpoints de admin                                                          | pendiente |        |
| T6  | S4, S5 | Web: panel admin                                                                               | pendiente |        |
| T7  | S3, S6 | Checkout: inscripción + order de MP                                                            | pendiente |        |
| T8  | S3     | Webhook MP + cola de pagos idempotente                                                         | pendiente |        |
| T9  | S2     | Puerto `EducationPlatform` + adaptador pending + cola de alta                                  | pendiente |        |
| T10 | S1     | Deploy: standalone, railpack, env, checklist Dokploy                                           | pendiente |        |
| T11 | S1     | Borrar `legacy/`                                                                               | pendiente |        |

## Log

- **L1** (2026-11-16) — "Bien, tenemos que pasar este proyecto a mi stack de Next y Nest, recuerda seguir las practicas que tenemos configuradas en infra-lautaro y stack-lautaro"
- **L2** (2026-11-16) — "Realmente tienen un sistema llamado plataforma educativa, donde los usuarios pueden tener sus cursos con su usuario, cuando compren los cursos, tendrian que de alguna forma darles acceso a esa plataforma. Aun no tenemos la api pero dejemos todo sedimentando"
- **L3** (2026-11-16) — "Si, iria real" (Mercado Pago real, Orders API).
- **L4** (2026-11-16) — T1 verificado: `npm run test:e2e -w api` (1/1 verde, `GET /api/health` → 200), `npm run build -w api`, `npm run build -w web` (standalone en `.next/standalone/apps/web/server.js`, caso monorepo), `npx biome check` sin errores.
