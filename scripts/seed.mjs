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

const count = db.prepare("SELECT COUNT(*) AS count FROM drinks WHERE is_deleted = 0").get().count;
if (count > 0) {
  console.log("Seed skipped: drinks already exist.");
  process.exit(0);
}

const sourceImages = [
  ["red.png", "ruby-sour.webp"],
  ["orange.png", "aperol-highball.webp"],
  ["blue.png", "midnight-fizz.webp"],
  ["yellow.png", "golden-collins.webp"],
];

for (const [source, target] of sourceImages) {
  fs.copyFileSync(path.join(root, "images", source), path.join(uploadsDir, target));
}

const drinks = [
  {
    id: "ruby-sour",
    name: "Ruby Sour",
    description: "Ягодная кислинка, сухой финиш и плотная пена.",
    ingredients: "Gin, raspberry, lemon, aquafaba",
    recipe: "45 ml gin, 25 ml lemon, 20 ml raspberry syrup, aquafaba. Shake hard, coupe.",
    image_path: "ruby-sour.webp",
  },
  {
    id: "aperol-highball",
    name: "Aperol Highball",
    description: "Легкий аперитив с апельсином, содовой и горькой нотой.",
    ingredients: "Aperol, orange, prosecco, soda",
    recipe: "60 ml Aperol, 60 ml prosecco, orange, top soda. Build over ice.",
    image_path: "aperol-highball.webp",
  },
  {
    id: "midnight-fizz",
    name: "Midnight Fizz",
    description: "Холодный цитрус, минералы и мягкая сладость на льду.",
    ingredients: "Vodka, blue curacao, lime, tonic",
    recipe: "45 ml vodka, 20 ml blue curacao, 20 ml lime, top tonic. Highball.",
    image_path: "midnight-fizz.webp",
  },
  {
    id: "golden-collins",
    name: "Golden Collins",
    description: "Солнечный long drink с лимоном, медом и сухой содовой.",
    ingredients: "Gin, lemon, honey, soda",
    recipe: "45 ml gin, 25 ml lemon, 20 ml honey syrup, top soda. Collins glass.",
    image_path: "golden-collins.webp",
  },
];

const insert = db.prepare(`
  INSERT INTO drinks
    (id, name, description, ingredients, recipe, image_path, video_path, position, created_at)
  VALUES
    (@id, @name, @description, @ingredients, @recipe, @image_path, NULL, @position, @created_at)
`);
const created_at = new Date().toISOString();
drinks.forEach((drink, position) => insert.run({ ...drink, position, created_at }));

console.log(`Seeded ${drinks.length} drinks.`);
