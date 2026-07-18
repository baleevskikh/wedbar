"use client";

import { nanoid } from "nanoid";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import {
  addOrderToHistory,
  getServerCartSnapshot,
  readPendingClientRequestId,
  readCart,
  subscribeCart,
  writeCart,
  writePendingClientRequestId,
} from "../../../cart-storage";
import type { Drink } from "../../../drinks";
import type { Order } from "@/lib/types";
import { CartHeader } from "./cart-header";
import { CartItemList } from "./cart-item-list";
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
    const controller = new AbortController();

    fetch("/api/drinks", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Не удалось загрузить меню");
        }
        return response.json();
      })
      .then((data: { drinks: Drink[] }) => setDrinks(data.drinks))
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setError(error instanceof Error ? error.message : "Не удалось загрузить меню");
          setHasLoadedDrinks(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setHasLoadedDrinks(true);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!hasLoadedDrinks || isSubmitting || error || selectedItems.length > 0) {
      return;
    }

    router.replace(`/?table=${table}`);
  }, [error, hasLoadedDrinks, isSubmitting, router, selectedItems.length, table]);

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
    clientRequestIdRef.current ??= readPendingClientRequestId() ?? nanoid(14);
    writePendingClientRequestId(clientRequestIdRef.current);

    try {
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
      const data = (await response.json().catch(() => null)) as
        | { order: Order; error?: { message?: string; details?: { drinkId?: string } } }
        | null;

      if (!response.ok) {
        const unavailableId = data?.error?.details?.drinkId;
        if (unavailableId) {
          updateQuantity(unavailableId, 0);
        }
        setError(data?.error?.message ?? "Не удалось отправить заказ");
        setIsSubmitting(false);
        writePendingClientRequestId(null);
        clientRequestIdRef.current = null;
        return;
      }

      if (!data?.order) {
        throw new Error("Сервер не вернул заказ");
      }

      writeCart({});
      writePendingClientRequestId(null);
      clientRequestIdRef.current = null;
      addOrderToHistory(
        String(data.order.id),
        data.order.items.map((item) => ({
          drinkId: item.drinkId,
          drinkName: item.drinkName,
          imagePath: item.imagePath,
        })),
      );
      router.push(`/order/${data.order.id}?table=${table}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось отправить заказ");
      setIsSubmitting(false);
    }
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
          {error ? (
            <div className="grid min-h-[60dvh] place-items-center px-6 text-center">
              <p className="rounded-xl bg-[#ffc4c4] px-4 py-3 font-bold text-black">{error}</p>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
