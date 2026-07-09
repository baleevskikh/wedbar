import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const uploadsDir = path.join(dataDir, "uploads");
const dbPath = path.join(dataDir, "wedbar.db");

fs.mkdirSync(uploadsDir, { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS drinks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    ingredients TEXT NOT NULL DEFAULT '',
    recipe TEXT NOT NULL DEFAULT '',
    image_path TEXT NOT NULL,
    video_path TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    is_stopped INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    table_number INTEGER NOT NULL,
    comment TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('pending','in_progress','delivering','rejected')),
    reject_reason TEXT,
    created_at TEXT NOT NULL,
    accepted_at TEXT,
    ready_at TEXT,
    closed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    order_id TEXT NOT NULL REFERENCES orders(id),
    drink_id TEXT NOT NULL REFERENCES drinks(id),
    drink_name TEXT NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    PRIMARY KEY (order_id, drink_id)
  );

  CREATE INDEX IF NOT EXISTS idx_drinks_menu ON drinks(is_deleted, is_stopped, position);
  CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number);
  PRAGMA user_version = 1;
`);

console.log("Database schema is ready.");
