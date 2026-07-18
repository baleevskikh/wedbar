#!/usr/bin/env sh
set -eu

docker compose pull caddy
docker compose up -d --build
docker compose ps
docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/drinks').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
