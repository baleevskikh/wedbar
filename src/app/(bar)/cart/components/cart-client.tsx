"use client";

import { nanoid } from "nanoid";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import {
  addOrderToHistory,
  getServerCartSnapshot,
  readCart,
  subscribeCart,
  writeActiveOrderId,
  writeCart,
} from "../../../cart-storage";
import type { Drink } from "../../../drinks";
import { CartHeader } from "./cart-header";
import { CartItemList } from "./cart-item-list";
import { EmptyCart } from "./empty-cart";
import { OrderFooter } from "./order-footer";

export function CartClient({ table }: { table: number }) {
  const router = useRouter();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedDrinks, setHasLoadedDrinks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clientRequestIdRef = useRef<string | null>(null);
  const quantities = useSyncExternalStore(subscribeCart, readCart, getServerCartSnapshot);
  const selectedItems = useMemo(
    () =>
      drinks
        .map((drink) => ({ drink, qty: quantities[drink.id] ?? 0 }))
        .filter((item) => item.qty > 0),
    [drinks, quantities],
  );

  useEffect(() => {
    fetch("/api/drinks", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { drinks: Drink[] }) => setDrinks(data.drinks))
      .finally(() => setHasLoadedDrinks(true));
  }, []);

  function updateQuantity(id: string, nextQty: number) {
    setError(null);
    const current = readCart();
    const next = { ...current };

    if (nextQty > 0) {
      next[id] = nextQty;
    } else {
      delete next[id];
    }

    writeCart(next);
  }

  async function submitOrder() {
    if (isSubmitting || selectedItems.length === 0) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    clientRequestIdRef.current ??= nanoid(14);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientRequestId: clientRequestIdRef.current,
        table,
        comment,
        items: selectedItems.map(({ drink, qty }) => ({ drinkId: drink.id, qty })),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      const unavailableId = data.error?.details?.drinkId;
      if (unavailableId) {
        updateQuantity(unavailableId, 0);
      }
      setError(data.error?.message ?? "Не удалось отправить заказ");
      setIsSubmitting(false);
      clientRequestIdRef.current = null;
      return;
    }

    writeCart({});
    clientRequestIdRef.current = null;
    writeActiveOrderId(String(data.order.id));
    addOrderToHistory(String(data.order.id));
    router.push(`/order/${data.order.id}?table=${table}`);
  }

  function clearCart() {
    setError(null);
    writeCart({});
  }

  return (
    <main className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black text-white">
      {!hasLoadedDrinks ? (
        <>
          <CartHeader onClearCart={clearCart} table={table} />
        </>
      ) : selectedItems.length > 0 ? (
        <>
          <CartHeader onClearCart={clearCart} table={table} />
          <CartItemList items={selectedItems} onQuantityChange={updateQuantity} />
          <OrderFooter
            comment={comment}
            disabled={isSubmitting}
            error={error}
            onCommentChange={setComment}
            onSubmit={submitOrder}
          />
        </>
      ) : (
        <>
          <CartHeader onClearCart={clearCart} table={table} />
          <EmptyCart />
        </>
      )}
    </main>
  );
}
