"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  getServerCartSnapshot,
  readCart,
  readOrderHistoryEntries,
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
  const [error, setError] = useState<string | null>(null);
  const [activeDrinkIndex, setActiveDrinkIndex] = useState(0);
  const [history, setHistory] = useState(() =>
    typeof window === "undefined" ? [] : readOrderHistoryEntries(),
  );
  const quantities = useSyncExternalStore(subscribeCart, readCart, getServerCartSnapshot);
  const selectedDrinks = drinks.filter((drink) => (quantities[drink.id] ?? 0) > 0);
  const totalDrinks = selectedDrinks.reduce(
    (total, drink) => total + (quantities[drink.id] ?? 0),
    0,
  );

  async function loadDrinks(signal?: AbortSignal) {
    try {
      const response = await fetch("/api/drinks", { cache: "no-store", signal });
      if (!response.ok) {
        throw new Error("Не удалось загрузить меню");
      }
      const data = (await response.json()) as { drinks: Drink[] };
      setDrinks(data.drinks);
      setError(null);
      setIsLoading(false);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setError(error instanceof Error ? error.message : "Не удалось загрузить меню");
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    try {
      window.localStorage.setItem("wedbar.table", String(table));
    } catch {
      // Table query parameter remains the source of truth.
    }
    queueMicrotask(() => {
      setHistory(readOrderHistoryEntries());
      void loadDrinks(controller.signal);
    });

    const events = new EventSource("/api/events");
    events.addEventListener("menu.updated", () => {
      loadDrinks(controller.signal);
    });

    return () => {
      controller.abort();
      events.close();
    };
  }, [table]);

  function addDrink(id: string) {
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

  if (error) {
    return (
      <main className="grid h-dvh place-items-center bg-black px-6 text-center text-white">
        <div>
          <p className="rounded-xl bg-[#ffc4c4] px-4 py-3 font-bold text-black">{error}</p>
          <button
            className="mt-4 h-12 rounded-[10px] bg-white px-5 font-bold text-black"
            onClick={() => {
              setIsLoading(true);
              void loadDrinks();
            }}
            type="button"
          >
            Обновить
          </button>
        </div>
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
          isOrderingBlocked={false}
          key={drink.id}
          qty={quantities[drink.id] ?? 0}
          removeDrink={removeDrink}
        />
      ))}
    </main>
  );
}
