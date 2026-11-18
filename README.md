# Liceo Laprida

Sitio de Red Cima y del Liceo Profesional Laprida (San Juan): catálogo de cursos, inscripción con pago por Mercado Pago y panel de administración.

| App        | Stack                                                                  | Puerto |
| ---------- | ---------------------------------------------------------------------- | ------ |
| `apps/web` | Next.js 16 (App Router, standalone)                                    | 3000   |
| `apps/api` | NestJS 12 sobre Fastify, Prisma 7 + MySQL, BullMQ + Redis, Better Auth | 4000   |

La web reescribe `/api/*` hacia la API, así el navegador habla con un solo dominio (cookies de sesión y webhook de Mercado Pago incluidos). En producción las dos corren en el mismo contenedor y la API no se expone.

## Desarrollo local

Requisitos: Node 24, MySQL 8 y Redis 7 (las colas de pagos y de alta en la plataforma lo necesitan).

```bash
npm install
npm run db:migrate -w api        # aplica las migraciones
npm run db:seed -w api           # carga contenido, cursos y fichas de ejemplo
npm run admin:create -w api -- correo@dominio una-clave-larga "Nombre"
npm run dev                      # API (:4000/api/health) y web (:3000) juntos
# o por separado: npm run dev:api / npm run dev:web
```

`.env` en la raíz del repo (lo leen las dos apps; un `.env` dentro de `apps/api` o `apps/web` también se carga, pero el de la raíz tiene prioridad):

```
DATABASE_URL=mysql://usuario:clave@localhost:3306/laprida
BETTER_AUTH_SECRET=      # string aleatorio de 32+ caracteres
REDIS_URL=redis://localhost:6379
PUBLIC_SITE_URL=http://localhost:3000
UPLOADS_DIR=./uploads
MP_ACCESS_TOKEN=         # credencial de prueba de Mercado Pago
MP_WEBHOOK_SECRET=       # clave secreta de webhooks de la app de Mercado Pago
API_INTERNAL_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Tests: `npm test -w api` (unitarios) y `npm run test:e2e -w api` (necesita Redis).

## Deploy en Dokploy

Un solo servicio con Railpack (`railpack.json` en la raíz). El arranque (`node scripts/start.mjs`) aplica las migraciones y levanta los dos procesos en el mismo contenedor: la API en el puerto 4000 (heap 256 MB) y la web standalone en `PORT` (3000 por defecto, heap 384 MB). Si cualquiera de los dos se cae, el contenedor se baja entero para que Dokploy lo reinicie.

- Railpack 0.39 o superior y `RAILPACK_PRUNE_DEPS=true` (el arranque solo usa `node` y el CLI de Prisma, que está en `dependencies`).
- Memory Limit: unos 1,3 GB (el doble de la suma de los dos heaps).
- Puerto del dominio: el de la web (3000). La API no se expone; la web la alcanza por `127.0.0.1:4000`.
- Bind mount de fotos en `/srv/uploads/liceo-laprida`, con `UPLOADS_DIR` igual al Mount Path.
- Una sola réplica: las migraciones corren en cada arranque.

En el VPS no hay `.env`: todo va en la pestaña Environment del servicio.

| Variable                               | Valor                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`                         | usuario propio de la base, con permisos solo sobre ella                   |
| `DATABASE_POOL_MAX`                    | `5` (sumar con las demás apps de la instancia)                            |
| `REDIS_URL`                            | instancia con `maxmemory-policy noeviction`                               |
| `BETTER_AUTH_SECRET`                   | aleatorio, distinto por entorno                                           |
| `PUBLIC_SITE_URL`                      | `https://dominio-del-sitio`                                               |
| `NEXT_PUBLIC_SITE_URL`                 | `https://dominio-del-sitio` (se usa en el build: cambiarla exige rebuild) |
| `UPLOADS_DIR`                          | igual al Mount Path del bind mount                                        |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | credenciales de producción de Mercado Pago                                |
| `NODE_ENV`                             | `production`                                                              |

## Primer deploy

1. Crear la base y el usuario en la instancia MySQL compartida.
2. Crear el servicio, cargar las variables y el bind mount, y desplegar.
3. En la terminal del contenedor: `node apps/api/dist/scripts/seed.js` y `node apps/api/dist/scripts/create-admin.js correo clave Nombre`.
4. En Mercado Pago, _Tus integraciones → Webhooks_: URL `https://dominio/api/webhooks/mercadopago`, evento **Order (Mercado Pago)**; copiar la clave secreta a `MP_WEBHOOK_SECRET` y probar con "Simular notificación".

## Plataforma educativa

Cuando un pago se aprueba, la API encola el alta del alumno en la plataforma educativa. Mientras la plataforma no tenga API, el adaptador `PendingEducationPlatform` deja la ficha en "Plataforma: Pendiente" y el equipo da el alta a mano desde el panel (Alumnos → filtro "Esperan el alta"). Para conectar la API real: implementar `EducationPlatform` (`apps/api/src/platform/education-platform.ts`) y registrarla en `platform.module.ts` en lugar del adaptador pendiente.
