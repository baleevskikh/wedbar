export const CART_STORAGE_KEY = "wedbar.cart";
export const ACTIVE_ORDER_STORAGE_KEY = "wedbar.activeOrderId";
export const ORDER_HISTORY_STORAGE_KEY = "wedbar.orderHistory";
const CART_CHANGED_EVENT = "wedbar.cart.changed";

export type CartQuantities = Record<string, number>;

const EMPTY_CART: CartQuantities = {};
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

export function readOrderHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function addOrderToHistory(orderId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const next = [orderId, ...readOrderHistory().filter((id) => id !== orderId)].slice(0, 12);
  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(next));
}
