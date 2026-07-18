export const CART_STORAGE_KEY = "wedbar.cart";
export const ACTIVE_ORDER_STORAGE_KEY = "wedbar.activeOrderId";
export const ORDER_HISTORY_STORAGE_KEY = "wedbar.orderHistory";
const CART_CHANGED_EVENT = "wedbar.cart.changed";

export type CartQuantities = Record<string, number>;
export type OrderHistoryEntry = {
  id: string;
  items: Array<{
    drinkId: string;
    drinkName: string;
    imagePath: string | null;
  }>;
};

const EMPTY_CART: CartQuantities = {};
const EMPTY_ORDER_HISTORY: OrderHistoryEntry[] = [];
let lastRawCart: string | null = null;
let lastCartSnapshot: CartQuantities = EMPTY_CART;

export function readCart(): CartQuantities {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      lastRawCart = null;
      lastCartSnapshot = EMPTY_CART;
      return EMPTY_CART;
    }

    if (rawCart === lastRawCart) {
      return lastCartSnapshot;
    }

    const parsedCart = JSON.parse(rawCart) as CartQuantities;

    lastRawCart = rawCart;
    lastCartSnapshot = Object.fromEntries(
      Object.entries(parsedCart).filter(([, qty]) => Number.isInteger(qty) && qty > 0),
    );

    return lastCartSnapshot;
  } catch {
    return EMPTY_CART;
  }
}

export function writeCart(quantities: CartQuantities) {
  if (typeof window === "undefined") {
    return;
  }

  const nextCart = Object.fromEntries(
    Object.entries(quantities).filter(([, qty]) => qty > 0),
  );

  if (Object.keys(nextCart).length > 0) {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
  } else {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function subscribeCart(listener: () => void) {
  window.addEventListener(CART_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getServerCartSnapshot(): CartQuantities {
  return EMPTY_CART;
}

export function readActiveOrderId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
}

export function writeActiveOrderId(orderId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (orderId) {
    window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, orderId);
  } else {
    window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
  }
}

export function readOrderHistoryEntries(): OrderHistoryEntry[] {
  if (typeof window === "undefined") {
    return EMPTY_ORDER_HISTORY;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY) ?? "[]");

    if (!Array.isArray(parsed)) {
      return EMPTY_ORDER_HISTORY;
    }

    return parsed
      .map((item): OrderHistoryEntry | null => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const entry = item as {
          id?: unknown;
          items?: unknown;
        };

        if (typeof entry.id !== "string") {
          return null;
        }

        if (!Array.isArray(entry.items)) {
          return null;
        }

        const items = entry.items
          .map((historyItem): OrderHistoryEntry["items"][number] | null => {
            if (!historyItem || typeof historyItem !== "object") {
              return null;
            }

            const itemData = historyItem as {
              drinkId?: unknown;
              drinkName?: unknown;
              imagePath?: unknown;
            };

            if (typeof itemData.drinkId !== "string" || typeof itemData.drinkName !== "string") {
              return null;
            }

            return {
              drinkId: itemData.drinkId,
              drinkName: itemData.drinkName,
              imagePath: typeof itemData.imagePath === "string" ? itemData.imagePath : null,
            };
          })
          .filter((item): item is OrderHistoryEntry["items"][number] => Boolean(item));

        return items.length > 0 ? { id: entry.id, items } : null;
      })
      .filter((entry): entry is OrderHistoryEntry => Boolean(entry));
  } catch {
    return EMPTY_ORDER_HISTORY;
  }
}

export function addOrderToHistory(orderId: string, items: OrderHistoryEntry["items"]) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readOrderHistoryEntries();
  const next = [
    {
      id: orderId,
      items,
    },
    ...existing.filter((entry) => entry.id !== orderId),
  ].slice(0, 12);

  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(next));
}
