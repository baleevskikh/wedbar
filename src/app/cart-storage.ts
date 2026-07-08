export const CART_STORAGE_KEY = "wedbar.cart";
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
