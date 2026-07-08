"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { Drink } from "@/app/drinks";

export default function DrinksPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
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
  }, []);

  async function patchDrink(id: string, body: unknown) {
    await fetch(`/api/drinks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    loadDrinks();
  }

  async function deleteDrink(id: string) {
    if (!window.confirm("Удалить напиток из меню?")) {
      return;
    }
    await fetch(`/api/drinks/${id}`, { method: "DELETE" });
    loadDrinks();
  }

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-5 md:px-6 md:py-6 xl:px-8">
      <header className="flex flex-col gap-4 rounded-[18px] bg-[#242424] p-5 sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c7efad]">Меню гостей</p>
          <h1 className="mt-2 text-[34px] font-black leading-none sm:text-[44px] md:text-[56px]">Напитки</h1>
        </div>
        <Link className="grid h-12 place-items-center rounded-[10px] bg-[#c7efad] px-5 text-base font-bold text-black" href={`/admin/${slug}/drinks/new`}>
          Добавить
        </Link>
      </header>

      <div className="overflow-hidden rounded-[18px] bg-white text-black">
        {drinks.map((drink, index) => (
          <div className="grid gap-3 border-b border-black/6 p-4 last:border-b-0 xl:grid-cols-[56px_minmax(240px,1fr)_130px_260px]" key={drink.id}>
            <span className="text-lg font-black text-black/35">#{index + 1}</span>
            <div className="min-w-0">
              <strong className="block truncate text-xl">{drink.name}</strong>
              <p className="truncate text-sm font-semibold text-black/45">{drink.ingredients}</p>
            </div>
            <button
              className={["h-10 rounded-[9px] px-3 text-sm font-bold", drink.isStopped ? "bg-[#ffc4c4]" : "bg-[#dff1d6]"].join(" ")}
              onClick={() => patchDrink(drink.id, { isStopped: !drink.isStopped })}
              type="button"
            >
              {drink.isStopped ? "В стопе" : "В меню"}
            </button>
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button className="rounded-[9px] bg-black/6 px-3 py-2 text-sm font-bold" onClick={() => patchDrink(drink.id, { move: "up" })} type="button">
                Выше
              </button>
              <button className="rounded-[9px] bg-black/6 px-3 py-2 text-sm font-bold" onClick={() => patchDrink(drink.id, { move: "down" })} type="button">
                Ниже
              </button>
              <Link className="rounded-[9px] bg-[#c7efad] px-3 py-2 text-sm font-bold" href={`/admin/${slug}/drinks/${drink.id}`}>
                Править
              </Link>
              <button className="rounded-[9px] bg-[#ffc4c4] px-3 py-2 text-sm font-bold" onClick={() => deleteDrink(drink.id)} type="button">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
