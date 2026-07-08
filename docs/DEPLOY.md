# WedBar deploy

## Build

```bash
npm ci
cp .env.example .env
# set BARTENDER_SLUG and ADMIN_SLUG in .env
npm run seed
npm run build
npm start
```

Run one `next start` process only. SQLite and the SSE bus are local to this process.

## systemd

```ini
[Unit]
Description=WedBar
After=network.target

[Service]
WorkingDirectory=/opt/wedbar
Environment=NODE_ENV=production
EnvironmentFile=/opt/wedbar/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
User=wedbar

[Install]
WantedBy=multi-user.target
```

## Caddy

```caddyfile
wedbar.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

Keep `data/` on persistent disk. Before the event, take a backup:

```bash
tar -czf wedbar-data-backup.tgz data/
```
