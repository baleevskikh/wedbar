"use client";

import { nanoid } from "nanoid";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      .then((data: { drinks: Drink[] }) => setDrinks(data.drinks));
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
    const orderId = nanoid(14);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
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
      return;
    }

    writeCart({});
    writeActiveOrderId(data.order.id);
    addOrderToHistory(data.order.id);
    router.push(`/order/${data.order.id}?table=${table}`);
  }

  function clearCart() {
    setError(null);
    writeCart({});
  }

  return (
    <main className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black text-white">
      <CartHeader onClearCart={clearCart} table={table} />

      {selectedItems.length > 0 ? (
        <>
          <CartItemList items={selectedItems} onQuantityChange={updateQuantity} />
          <div className="px-4 pb-4 sm:px-6">
            <label className="block">
              <span className="text-sm font-semibold text-white/55">Комментарий к заказу</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-2xl bg-white px-4 py-3 text-base font-medium text-black outline-none"
                maxLength={300}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Например: без льда"
                value={comment}
              />
            </label>
            {error ? (
              <p className="mt-3 rounded-2xl bg-[#ffc4c4] px-4 py-3 text-sm font-bold text-black">
                {error}
              </p>
            ) : null}
          </div>
          <OrderFooter disabled={isSubmitting} onSubmit={submitOrder} />
        </>
      ) : (
        <EmptyCart />
      )}
    </main>
  );
}
