#!/bin/bash
# Arranque de produccion: el sitio y el API en el mismo contenedor. Si uno se
# cae, corta el otro y sale con error, asi Dokploy reinicia el contenedor. En
# bash y no en Node: un proceso de Node solo para esperar a los otros dos
# ocupa ~45 MB.

api_port="${API_PORT:-4000}"

PORT="$api_port" node apps/api/dist/bundle/main.mjs > >(sed -u 's/^/[api] /') 2>&1 &
api=$!
API_INTERNAL_URL="${API_INTERNAL_URL:-http://127.0.0.1:$api_port}" \
  node apps/web/.next/standalone/apps/web/server.js > >(sed -u 's/^/[web] /') 2>&1 &
web=$!

apagar() {
  kill -TERM "$web" "$api" 2>/dev/null
  wait "$web" "$api"
  exit "$1"
}
trap 'apagar 0' TERM INT

wait -n "$web" "$api"
codigo=$?
echo "uno de los procesos termino ($codigo), corto el resto" >&2
apagar $((codigo == 0 ? 1 : codigo))
