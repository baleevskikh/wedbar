"use client";

import { useState, useSyncExternalStore } from "react";

import {
  getServerCartSnapshot,
  readCart,
  subscribeCart,
  writeCart,
} from "../../cart-storage";
import { drinks } from "../../drinks";
import { CartHeader } from "./components/cart-header";
import { CartItemList } from "./components/cart-item-list";
import { EmptyCart } from "./components/empty-cart";
import { OrderFooter } from "./components/order-footer";

export default function CartPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const quantities = useSyncExternalStore(
    subscribeCart,
    readCart,
    getServerCartSnapshot,
  );
  const selectedItems = drinks
    .map((drink) => ({
      drink,
      qty: quantities[drink.id] ?? 0,
    }))
    .filter((item) => item.qty > 0);

  function updateQuantity(id: string, nextQty: number) {
    setIsSubmitted(false);
    const current = readCart();
    const next = { ...current };

    if (nextQty > 0) {
      next[id] = nextQty;
    } else {
      delete next[id];
    }

    writeCart(next);
  }

  function submitOrderPreview() {
    setIsSubmitted(true);
  }

  function clearCart() {
    setIsSubmitted(false);
    writeCart({});
  }

  return (
    <main className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black text-white">
      <CartHeader onClearCart={clearCart} />

      {selectedItems.length > 0 ? (
        <>
          <CartItemList items={selectedItems} onQuantityChange={updateQuantity} />
          <OrderFooter isSubmitted={isSubmitted} onSubmit={submitOrderPreview} />
        </>
      ) : (
        <EmptyCart />
      )}
    </main>
  );
}
