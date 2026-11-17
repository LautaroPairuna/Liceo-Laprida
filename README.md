# Liceo Laprida

Sitio de Red Laprida y del Liceo Profesional Laprida (San Juan): catálogo de cursos, inscripción con pago por Mercado Pago y panel de administración.

| App        | Stack                                                                  | Puerto |
| ---------- | ---------------------------------------------------------------------- | ------ |
| `apps/web` | Next.js 16 (App Router, standalone)                                    | 3000   |
| `apps/api` | NestJS 12 sobre Fastify, Prisma 7 + MySQL, BullMQ + Redis, Better Auth | 4000   |

La web reescribe `/api/*` hacia la API, así el navegador habla con un solo dominio (cookies de sesión y webhook de Mercado Pago incluidos). La API no necesita dominio público.

## Desarrollo local

Requisitos: Node 24, MySQL 8 y Redis 7 (las colas de pagos y de alta en la plataforma lo necesitan).

```bash
npm install
npm run db:migrate -w api        # aplica las migraciones
npm run db:seed -w api           # carga contenido, cursos y fichas de ejemplo
npm run admin:create -w api -- correo@dominio una-clave-larga "Nombre"
npm run dev:api                  # http://localhost:4000/api/health
npm run dev:web                  # http://localhost:3000
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

## Variables por servicio (Dokploy)

En el VPS no hay `.env`: cada servicio tiene su Environment y recibe solo lo que usa (la web nunca ve los secretos de la base, de la sesión ni de Mercado Pago).

**API** (`RAILPACK_CONFIG_FILE=railpack.api.json`)

| Variable                               | Valor                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`                         | usuario propio de la base, con permisos solo sobre ella                     |
| `DATABASE_POOL_MAX`                    | `5` (sumar con las demás apps de la instancia)                              |
| `REDIS_URL`                            | instancia con `maxmemory-policy noeviction`                                 |
| `BETTER_AUTH_SECRET`                   | aleatorio, distinto por entorno                                             |
| `PUBLIC_SITE_URL`                      | `https://dominio-del-sitio`                                                 |
| `UPLOADS_DIR`                          | igual al Mount Path del bind mount (`/srv/uploads/liceo-laprida` en el VPS) |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | credenciales de producción de Mercado Pago                                  |
| `NODE_ENV`                             | `production`                                                                |

**Web** (`RAILPACK_CONFIG_FILE=railpack.web.json`)

| Variable               | Valor                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `API_INTERNAL_URL`     | URL interna de la API en la red de Docker, por ejemplo `http://liceo-laprida-api:4000` (también se usa en el build: el rewrite queda fijo al compilar) |
| `NEXT_PUBLIC_SITE_URL` | `https://dominio-del-sitio` (se usa en el build: cambiarla exige rebuild)                                                                              |

## Primer deploy

1. Crear la base y el usuario en la instancia MySQL compartida.
2. Desplegar la API: aplica las migraciones al arrancar (`prisma migrate deploy` en el comando de arranque, una sola réplica).
3. En la terminal del contenedor de la API: `node apps/api/dist/scripts/seed.js` y `node apps/api/dist/scripts/create-admin.js correo clave Nombre`.
4. Desplegar la web y apuntar el dominio a ella.
5. En Mercado Pago, _Tus integraciones → Webhooks_: URL `https://dominio/api/webhooks/mercadopago`, evento **Order (Mercado Pago)**; copiar la clave secreta a `MP_WEBHOOK_SECRET` y probar con "Simular notificación".

## Plataforma educativa

Cuando un pago se aprueba, la API encola el alta del alumno en la plataforma educativa. Mientras la plataforma no tenga API, el adaptador `PendingEducationPlatform` deja la ficha en "Plataforma: Pendiente" y el equipo da el alta a mano desde el panel (Alumnos → filtro "Esperan el alta"). Para conectar la API real: implementar `EducationPlatform` (`apps/api/src/platform/education-platform.ts`) y registrarla en `platform.module.ts` en lugar del adaptador pendiente.
