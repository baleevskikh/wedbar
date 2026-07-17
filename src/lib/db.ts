import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(/* turbopackIgnore: true */ process.cwd(), "data");
const dbPath = path.join(dataDir, "wedbar.db");
const uploadsDir = path.join(dataDir, "uploads");

let db: Database.Database | null = null;

export function getUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true });
  return uploadsDir;
}

export function getDb() {
  if (!db) {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(uploadsDir, { recursive: true });
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }

  return db;
}

function migrate(database: Database.Database) {
  const version = database.pragma("user_version", { simple: true }) as number;

  if (version < 1) {
    database.exec(`
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

      CREATE INDEX IF NOT EXISTS idx_drinks_menu ON drinks(is_deleted, is_stopped, position);
      PRAGMA user_version = 1;
    `);
  }

  if (version < 2) {
    database.exec(`
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;

      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_request_id TEXT NOT NULL UNIQUE,
        table_number INTEGER NOT NULL,
        comment TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL CHECK (status IN ('pending','in_progress','delivering','rejected')),
        reject_reason TEXT,
        created_at TEXT NOT NULL,
        accepted_at TEXT,
        ready_at TEXT,
        closed_at TEXT
      );

      CREATE TABLE order_items (
        order_id INTEGER NOT NULL REFERENCES orders(id),
        drink_id TEXT NOT NULL REFERENCES drinks(id),
        drink_name TEXT NOT NULL,
        qty INTEGER NOT NULL CHECK (qty > 0),
        PRIMARY KEY (order_id, drink_id)
      );

      CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
      CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number);
      CREATE INDEX IF NOT EXISTS idx_orders_client_request ON orders(client_request_id);
      PRAGMA user_version = 2;
    `);
  }
}
