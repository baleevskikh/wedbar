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
sudo chown -R 1000:1000 data
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
docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/drinks').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
```

## Logs and status

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f caddy
```

## Prepare database

Run this to create or update the local database schema:

```bash
docker compose run --rm app npm run seed
```

## Persistent data

Keep `data/` on persistent disk. It contains:

- `data/wedbar.db`
- SQLite WAL files
- uploaded images and videos in `data/uploads/`

The app container runs as UID `1000`. Set ownership before the first start:

```bash
sudo chown -R 1000:1000 data
```

## Backups

Use SQLite backup for the live database, then archive that file together with uploads:

```bash
mkdir -p data/backups
docker compose exec -T app node -e "const Database=require('better-sqlite3'); const db=new Database('/app/data/wedbar.db'); db.backup('/app/data/backups/wedbar-$(date +%F-%H%M).db').then(()=>db.close())"
tar -czf wedbar-backup-$(date +%F-%H%M).tgz data/backups/ data/uploads/
```

Copy the archive off the VPS and run at least one restore check before the event.

## Notes

- Run one `app` container only. SQLite and the in-memory SSE event bus are local to this process.
- Do not commit `.env` or `data/`; they are intentionally ignored.
- Static export is not suitable for this app because it uses API routes, uploads, and SQLite.
