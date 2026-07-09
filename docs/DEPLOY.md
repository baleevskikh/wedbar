# WedBar deploy

Recommended production setup: one VPS/VDS, Docker Compose, Caddy as the HTTPS reverse proxy, and a persistent `data/` directory for SQLite and uploads.

## Server requirements

- Ubuntu/Debian VPS with Docker and Docker Compose plugin installed
- DNS `A` record pointing your domain to the VPS IP
- Open ports `80` and `443`
- At least 1 GB RAM; 2 GB is more comfortable for image/video processing

## First deploy

```bash
git clone <repo-url> wedbar
cd wedbar
cp .env.example .env
nano .env
mkdir -p data/uploads
docker compose up -d --build
```

Set these values in `.env`:

```dotenv
DOMAIN=bar.example.com
BARTENDER_SLUG=long-random-bartender-url
ADMIN_SLUG=long-random-admin-url
```

Caddy will issue and renew HTTPS certificates automatically for `DOMAIN`.

## Update deploy

From the project directory on the server:

```bash
git pull
sh scripts/deploy.sh
```

Equivalent manual command:

```bash
docker compose up -d --build
```

## Logs and status

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f caddy
```

## Seed demo data

Only run this if you want to populate the current database with demo drinks:

```bash
docker compose run --rm app npm run seed
```

## Persistent data

Keep `data/` on persistent disk. It contains:

- `data/wedbar.db`
- SQLite WAL files
- uploaded images and videos in `data/uploads/`

If the container cannot write to `data/`, fix ownership on the VPS:

```bash
sudo chown -R 1000:1000 data
```

## Backups

Stop writes briefly before a manual backup, or take the backup during a quiet period:

```bash
tar -czf wedbar-data-$(date +%F).tgz data/
```

For production use, add a daily cron backup and copy the archive off the VPS.

## Notes

- Run one `app` container only. SQLite and the in-memory SSE event bus are local to this process.
- Do not commit `.env` or `data/`; they are intentionally ignored.
- Static export is not suitable for this app because it uses API routes, uploads, and SQLite.
