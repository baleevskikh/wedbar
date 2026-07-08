"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  getServerCartSnapshot,
  readActiveOrderId,
  readCart,
  readOrderHistory,
  subscribeCart,
  writeCart,
} from "../../cart-storage";
import type { Drink } from "../../drinks";
import { DrinkNavigation } from "./drink-navigation";
import { DrinkSection } from "./drink-section";
import { HomeHeader } from "./home-header";

export function HomeClient({ table }: { table: number }) {
  const scrollRef = useRef<HTMLElement>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDrinkIndex, setActiveDrinkIndex] = useState(0);
  const [history, setHistory] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readOrderHistory(),
  );
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : readActiveOrderId(),
  );
  const quantities = useSyncExternalStore(subscribeCart, readCart, getServerCartSnapshot);
  const selectedDrinks = drinks.filter((drink) => (quantities[drink.id] ?? 0) > 0);
  const totalDrinks = selectedDrinks.reduce(
    (total, drink) => total + (quantities[drink.id] ?? 0),
    0,
  );
  const isOrderingBlocked = Boolean(activeOrderId);

  async function loadDrinks() {
    const response = await fetch("/api/drinks", { cache: "no-store" });
    const data = (await response.json()) as { drinks: Drink[] };
    setDrinks(data.drinks);
    setIsLoading(false);
  }

  useEffect(() => {
    window.localStorage.setItem("wedbar.table", String(table));
    queueMicrotask(() => {
      setHistory(readOrderHistory());
      setActiveOrderId(readActiveOrderId());
      void loadDrinks();
    });

    const events = new EventSource("/api/events");
    events.addEventListener("menu.updated", () => {
      loadDrinks();
    });

    return () => events.close();
  }, [table]);

  useEffect(() => {
    if (!activeOrderId) {
      return;
    }

    fetch(`/api/orders/${activeOrderId}`, { cache: "no-store" }).then((response) => {
      if (!response.ok || response.status === 404) {
        setActiveOrderId(null);
        return;
      }
      response.json().then(({ order }) => {
        if (order.status === "delivering" || order.status === "rejected") {
          setActiveOrderId(null);
        }
      });
    });
  }, [activeOrderId]);

  function addDrink(id: string) {
    if (isOrderingBlocked) {
      return;
    }
    const current = readCart();
    writeCart({ ...current, [id]: (current[id] ?? 0) + 1 });
  }

  function removeDrink(id: string) {
    const current = readCart();
    const nextQty = (current[id] ?? 0) - 1;
    const next = { ...current };

    if (nextQty > 0) {
      next[id] = nextQty;
    } else {
      delete next[id];
    }

    writeCart(next);
  }

  function updateActiveDrink() {
    const scroller = scrollRef.current;
    if (!scroller || drinks.length === 0) {
      return;
    }

    const nextIndex = Math.round(scroller.scrollTop / scroller.clientHeight);
    setActiveDrinkIndex(Math.min(Math.max(nextIndex, 0), drinks.length - 1));
  }

  function scrollToDrink(index: number) {
    scrollRef.current?.scrollTo({
      top: index * scrollRef.current.clientHeight,
      behavior: "smooth",
    });
  }

  if (isLoading) {
    return (
      <main className="grid h-dvh place-items-center bg-black text-white">
        <div className="h-[72dvh] w-[82%] animate-pulse rounded-[28px] bg-white/10" />
      </main>
    );
  }

  return (
    <main
      className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black text-white [scroll-snap-type:y_mandatory] [-webkit-overflow-scrolling:touch]"
      onScroll={updateActiveDrink}
      ref={scrollRef}
    >
      <HomeHeader
        history={history}
        selectedDrinks={selectedDrinks}
        table={table}
        totalDrinks={totalDrinks}
      />
      <DrinkNavigation activeDrinkIndex={activeDrinkIndex} drinks={drinks} onDrinkSelect={scrollToDrink} />

      {drinks.map((drink, index) => (
        <DrinkSection
          addDrink={addDrink}
          drink={drink}
          index={index}
          isOrderingBlocked={isOrderingBlocked}
          key={drink.id}
          qty={quantities[drink.id] ?? 0}
          removeDrink={removeDrink}
        />
      ))}

      {isOrderingBlocked ? (
        <a
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+18px)] left-1/2 z-40 w-[calc(100%-32px)] max-w-[448px] -translate-x-1/2 rounded-2xl bg-white px-5 py-4 text-center font-bold text-black shadow-[0_18px_46px_rgba(0,0,0,0.38)]"
          href={`/order/${activeOrderId}?table=${table}`}
        >
          У вас уже есть активный заказ
        </a>
      ) : null}
    </main>
  );
}
