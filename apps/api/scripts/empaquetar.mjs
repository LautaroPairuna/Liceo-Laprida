// Junta el API compilado y sus dependencias en dist/bundle, para que la imagen de
// produccion no necesite node_modules. Parte del JS que emite `nest build` y no del
// TypeScript: esbuild no emite la metadata de los decoradores, y sin ella la
// inyeccion de dependencias de Nest no funciona.
//
// dist/bundle esta a la misma profundidad que dist/site, asi el seed-data.json
// que lee site/defaults.ts (../../prisma) se encuentra igual en los dos casos.
import { build } from "esbuild";

await build({
  entryPoints: {
    main: "dist/main.js",
    seed: "dist/scripts/seed.js",
    "create-admin": "dist/scripts/create-admin.js",
  },
  outdir: "dist/bundle",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "node",
  target: "node24",
  legalComments: "none",
  // Nest usa el nombre de cada clase en los logs y en algunos mensajes de error.
  keepNames: true,
  logLevel: "warning",
  // Dependencias en CommonJS que hacen require() de modulos de Node.
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
  // Nest y su adaptador de Fastify los piden solo si se usan (microservicios,
  // websockets, validacion por clases, multipart, archivos estaticos, vistas):
  // este API no usa ninguno.
  external: [
    "@nestjs/microservices",
    "@nestjs/microservices/*",
    "@nestjs/websockets",
    "@nestjs/websockets/*",
    "@nestjs/platform-express",
    "@fastify/multipart",
    "@fastify/static",
    "@fastify/view",
    "class-validator",
    "class-transformer",
  ],
});
