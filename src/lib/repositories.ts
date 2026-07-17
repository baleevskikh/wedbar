import { nanoid } from "nanoid";

import { getDb } from "./db";
import { ConflictError, NotFoundError, ValidationError } from "./errors";
import type { ActiveOrdersResponse, Drink, Order, OrderStatus, Stats } from "./types";

type DrinkRow = {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  recipe: string;
  image_path: string;
  video_path: string | null;
  position: number;
  is_stopped: number;
  is_deleted: number;
  created_at: string;
};

type OrderRow = {
  id: number;
  client_request_id: string;
  table_number: number;
  comment: string;
  status: OrderStatus;
  reject_reason: string | null;
  created_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  closed_at: string | null;
};

type OrderItemRow = {
  order_id: number;
  drink_id: string;
  drink_name: string;
  image_path: string | null;
  recipe: string | null;
  qty: number;
};

function nowIso() {
  return new Date().toISOString();
}

function mapDrink(row: DrinkRow): Drink {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ingredients: row.ingredients,
    recipe: row.recipe,
    imagePath: row.image_path,
    videoPath: row.video_path,
    position: row.position,
    isStopped: row.is_stopped === 1,
    isDeleted: row.is_deleted === 1,
    createdAt: row.created_at,
  };
}

function mapOrder(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    tableNumber: row.table_number,
    comment: row.comment,
    status: row.status,
    rejectReason: row.reject_reason,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    readyAt: row.ready_at,
    closedAt: row.closed_at,
    items: items.map((item) => ({
      orderId: item.order_id,
      drinkId: item.drink_id,
      drinkName: item.drink_name,
      imagePath: item.image_path,
      recipe: item.recipe ?? "",
      qty: item.qty,
    })),
  };
}

export function listMenuDrinks() {
  const rows = getDb()
    .prepare(
      `SELECT * FROM drinks
       WHERE is_deleted = 0 AND is_stopped = 0
       ORDER BY position ASC, created_at ASC`,
    )
    .all() as DrinkRow[];

  return rows.map(mapDrink);
}

export function listAllDrinks() {
  const rows = getDb()
    .prepare(
      `SELECT * FROM drinks
       WHERE is_deleted = 0
       ORDER BY position ASC, created_at ASC`,
    )
    .all() as DrinkRow[];

  return rows.map(mapDrink);
}

export function getDrink(id: string) {
  const row = getDb().prepare("SELECT * FROM drinks WHERE id = ?").get(id) as
    | DrinkRow
    | undefined;
  return row ? mapDrink(row) : null;
}

export function createDrink(input: {
  name: string;
  description: string;
  ingredients: string;
  recipe: string;
  imagePath: string;
  videoPath: string | null;
}) {
  const db = getDb();
  const position = (
    db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next FROM drinks").get() as {
      next: number;
    }
  ).next;
  const drink: Drink = {
    id: nanoid(10),
    ...input,
    position,
    isStopped: false,
    isDeleted: false,
    createdAt: nowIso(),
  };

  db.prepare(
    `INSERT INTO drinks
      (id, name, description, ingredients, recipe, image_path, video_path, position, created_at)
     VALUES (@id, @name, @description, @ingredients, @recipe, @imagePath, @videoPath, @position, @createdAt)`,
  ).run(drink);

  return drink;
}

export function updateDrink(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    ingredients: string;
    recipe: string;
    imagePath: string;
    videoPath: string | null;
    isStopped: boolean;
  }>,
) {
  const current = getDrink(id);
  if (!current || current.isDeleted) {
    throw new NotFoundError("Напиток не найден");
  }

  const next = { ...current, ...input };
  getDb()
    .prepare(
      `UPDATE drinks
       SET name = @name,
           description = @description,
           ingredients = @ingredients,
           recipe = @recipe,
           image_path = @imagePath,
           video_path = @videoPath,
           is_stopped = @isStopped
       WHERE id = @id`,
    )
    .run({
      ...next,
      isStopped: next.isStopped ? 1 : 0,
    });

  return getDrink(id);
}

export function softDeleteDrink(id: string) {
  const result = getDb().prepare("UPDATE drinks SET is_deleted = 1 WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw new NotFoundError("Напиток не найден");
  }
}

export function moveDrink(id: string, direction: "up" | "down") {
  const drinks = listAllDrinks();
  const index = drinks.findIndex((drink) => drink.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0) {
    throw new NotFoundError("Напиток не найден");
  }

  if (!drinks[swapIndex]) {
    return drinks[index];
  }

  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("UPDATE drinks SET position = ? WHERE id = ?").run(
      drinks[swapIndex].position,
      drinks[index].id,
    );
    db.prepare("UPDATE drinks SET position = ? WHERE id = ?").run(
      drinks[index].position,
      drinks[swapIndex].id,
    );
  });
  tx();

  return getDrink(id);
}

export function createOrder(input: {
  clientRequestId: string;
  table: number;
  comment: string;
  items: Array<{ drinkId: string; qty: number }>;
}) {
  const db = getDb();
  const existing = getOrderByClientRequestId(input.clientRequestId);
  if (existing) {
    return { order: existing, created: false };
  }

  const uniqueItems = new Map<string, number>();
  for (const item of input.items) {
    uniqueItems.set(item.drinkId, (uniqueItems.get(item.drinkId) ?? 0) + item.qty);
  }

  if (uniqueItems.size === 0) {
    throw new ValidationError("Корзина пуста");
  }

  const placeholders = Array.from(uniqueItems.keys()).map(() => "?").join(",");
  const drinkRows = db
    .prepare(`SELECT * FROM drinks WHERE id IN (${placeholders})`)
    .all(...uniqueItems.keys()) as DrinkRow[];
  const drinksById = new Map(drinkRows.map((row) => [row.id, mapDrink(row)]));

  for (const drinkId of uniqueItems.keys()) {
    const drink = drinksById.get(drinkId);
    if (!drink || drink.isDeleted || drink.isStopped) {
      throw new ConflictError("Позиция недоступна", {
        drinkId,
        drinkName: drink?.name ?? "Напиток",
      });
    }
  }

  const createdAt = nowIso();
  let orderId = 0;
  const tx = db.transaction(() => {
    const result = db.prepare(
      `INSERT INTO orders (client_request_id, table_number, comment, status, created_at)
       VALUES (?, ?, ?, 'pending', ?)`,
    ).run(input.clientRequestId, input.table, input.comment, createdAt);
    orderId = Number(result.lastInsertRowid);

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, drink_id, drink_name, qty)
       VALUES (?, ?, ?, ?)`,
    );

    for (const [drinkId, qty] of uniqueItems) {
      const drink = drinksById.get(drinkId);
      if (!drink) {
        throw new ConflictError("Позиция недоступна", { drinkId });
      }
      insertItem.run(orderId, drinkId, drink.name, qty);
    }
  });
  tx();

  return { order: orderId ? getOrder(orderId) : null, created: true };
}

export function getOrder(id: number): Order | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  if (!row) {
    return null;
  }

  const items = db
    .prepare(
      `SELECT oi.order_id, oi.drink_id, oi.drink_name, oi.qty, d.image_path, d.recipe
       FROM order_items oi
       LEFT JOIN drinks d ON d.id = oi.drink_id
       WHERE oi.order_id = ?
       ORDER BY oi.rowid ASC`,
    )
    .all(id) as OrderItemRow[];

  return mapOrder(row, items);
}

function getOrderByClientRequestId(clientRequestId: string): Order | null {
  const row = getDb()
    .prepare("SELECT id FROM orders WHERE client_request_id = ?")
    .get(clientRequestId) as Pick<OrderRow, "id"> | undefined;

  return row ? getOrder(row.id) : null;
}

export function listActiveOrders(limit = 6): ActiveOrdersResponse {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM orders
       WHERE status IN ('pending', 'in_progress')
       ORDER BY created_at ASC
       LIMIT ?`,
    )
    .all(limit) as OrderRow[];
  const total = (
    db
      .prepare("SELECT COUNT(*) AS count FROM orders WHERE status IN ('pending', 'in_progress')")
      .get() as { count: number }
  ).count;

  return {
    orders: rows.map((row) => getOrder(row.id)).filter((order): order is Order => Boolean(order)),
    queued: Math.max(0, total - rows.length),
  };
}

export function transitionOrder(
  id: number,
  action: "accept" | "ready" | "reject",
  options: { rejectReason?: string; stopDrinkIds?: string[] } = {},
) {
  const db = getDb();
  let updated: Order | null = null;

  const tx = db.transaction(() => {
    const order = getOrder(id);
    if (!order) {
      throw new NotFoundError("Заказ не найден");
    }

    if (action === "accept") {
      if (order.status !== "pending") {
        throw new ConflictError("Заказ уже изменён");
      }
      db.prepare("UPDATE orders SET status = 'in_progress', accepted_at = ? WHERE id = ?").run(
        nowIso(),
        id,
      );
    }

    if (action === "ready") {
      if (order.status !== "in_progress") {
        throw new ConflictError("Заказ нельзя завершить из текущего статуса");
      }
      db.prepare("UPDATE orders SET status = 'delivering', ready_at = ? WHERE id = ?").run(
        nowIso(),
        id,
      );
    }

    if (action === "reject") {
      if (order.status !== "pending" && order.status !== "in_progress") {
        throw new ConflictError("Заказ нельзя отклонить из текущего статуса");
      }
      const reason = options.rejectReason?.trim();
      if (!reason) {
        throw new ValidationError("Нужен комментарий отклонения");
      }
      db.prepare("UPDATE orders SET status = 'rejected', reject_reason = ?, closed_at = ? WHERE id = ?").run(
        reason,
        nowIso(),
        id,
      );
      for (const drinkId of options.stopDrinkIds ?? []) {
        db.prepare("UPDATE drinks SET is_stopped = 1 WHERE id = ?").run(drinkId);
      }
    }

    updated = getOrder(id);
  });
  tx();

  return updated;
}

export function getStats(): Stats {
  const db = getDb();
  const summary = db
    .prepare(
      `SELECT
         COUNT(DISTINCT CASE WHEN o.status = 'delivering' THEN o.id END) AS totalOrders,
         COALESCE(SUM(CASE WHEN o.status = 'delivering' THEN oi.qty ELSE 0 END), 0) AS totalPortions,
         COUNT(DISTINCT CASE WHEN o.status = 'rejected' THEN o.id END) AS rejectedOrders,
         COUNT(DISTINCT CASE WHEN o.status = 'delivering' THEN o.table_number END) AS activeTables
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id`,
    )
    .get() as Stats["summary"];

  const topDrinks = db
    .prepare(
      `SELECT oi.drink_id AS drinkId, oi.drink_name AS name, SUM(oi.qty) AS portions
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'delivering'
       GROUP BY oi.drink_id, oi.drink_name
       ORDER BY portions DESC, name ASC`,
    )
    .all() as Stats["topDrinks"];

  const timeline = db
    .prepare(
      `SELECT strftime('%H:%M', datetime((strftime('%s', created_at) / 1800) * 1800, 'unixepoch')) AS label,
              COUNT(*) AS orders
       FROM orders
       GROUP BY label
       ORDER BY label ASC`,
    )
    .all() as Stats["timeline"];

  const tables = db
    .prepare(
      `SELECT o.table_number AS tableNumber,
              COUNT(DISTINCT o.id) AS orders,
              COALESCE(SUM(oi.qty), 0) AS portions
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.status = 'delivering'
       GROUP BY o.table_number
       ORDER BY portions DESC, orders DESC
       LIMIT 20`,
    )
    .all() as Stats["tables"];

  return { summary, topDrinks, timeline, tables };
}
