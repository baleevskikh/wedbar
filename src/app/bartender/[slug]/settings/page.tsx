"use client";

import { useEffect, useState } from "react";

import type { Drink } from "@/app/drinks";

export default function BartenderSettingsPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);

  async function loadDrinks() {
    const response = await fetch("/api/drinks?all=1", { cache: "no-store" });
    const data = (await response.json()) as { drinks: Drink[] };
    setDrinks(data.drinks);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadDrinks();
    });
    const events = new EventSource("/api/events");
    events.addEventListener("menu.updated", loadDrinks);
    return () => events.close();
  }, []);

  async function toggleDrink(drink: Drink) {
    await fetch(`/api/drinks/${drink.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStopped: !drink.isStopped }),
    });
    loadDrinks();
  }

  return (
    <section className="h-dvh overflow-hidden bg-black p-4 pl-[10px] text-white">
      <div className="flex h-full flex-col rounded-[18px] bg-[#242424] p-6">
        <header className="shrink-0">
          <h1 className="text-[34px] font-black leading-none">Настройки</h1>
          <p className="mt-2 text-lg text-white/55">Стоп-лист напитков</p>
        </header>

        <div className="mt-8 grid max-w-[620px] gap-3 overflow-auto">
          {drinks.map((drink) => (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-4 text-black" key={drink.id}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="size-5 shrink-0 rounded-full bg-black/12" />
                <span className="truncate text-xl font-bold">{drink.name}</span>
              </div>
              <button
                aria-pressed={drink.isStopped}
                className={["flex h-8 w-[58px] items-center rounded-full p-1 transition", drink.isStopped ? "justify-end bg-[#ff5d62]" : "justify-start bg-[#dff1d6]"].join(" ")}
                onClick={() => toggleDrink(drink)}
                type="button"
              >
                <span className="size-6 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
