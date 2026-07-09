#!/usr/bin/env sh
set -eu

docker compose pull caddy
docker compose up -d --build
docker compose ps
