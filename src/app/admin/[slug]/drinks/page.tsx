"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { Drink } from "@/app/drinks";
import { readApiJson, staffHeaders } from "@/app/staff-api";

export default function DrinksPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingDrinkId, setPendingDrinkId] = useState<string | null>(null);

  const loadDrinks = useCallback(async () => {
    try {
      const response = await fetch("/api/drinks?all=1", {
        cache: "no-store",
        headers: staffHeaders(slug),
      });
      const data = await readApiJson<{ drinks: Drink[] }>(response);
      setDrinks(data.drinks);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить напитки");
    }
  }, [slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDrinks();
    });
  }, [loadDrinks]);

  async function patchDrink(id: string, body: unknown) {
    if (pendingDrinkId) {
      return;
    }

    setError(null);
    setPendingDrinkId(id);
    try {
      const response = await fetch(`/api/drinks/${id}`, {
        method: "PATCH",
        headers: staffHeaders(slug, "json"),
        body: JSON.stringify(body),
      });
      await readApiJson(response);
      await loadDrinks();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось обновить напиток");
      void loadDrinks();
    } finally {
      setPendingDrinkId(null);
    }
  }

  async function deleteDrink(id: string) {
    if (pendingDrinkId) {
      return;
    }
    if (!window.confirm("Удалить напиток из меню?")) {
      return;
    }
    setError(null);
    setPendingDrinkId(id);
    try {
      const response = await fetch(`/api/drinks/${id}`, {
        method: "DELETE",
        headers: staffHeaders(slug),
      });
      await readApiJson(response);
      await loadDrinks();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить напиток");
    } finally {
      setPendingDrinkId(null);
    }
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
      {error ? <p className="rounded-xl bg-[#ffc4c4] px-4 py-3 font-bold text-black">{error}</p> : null}

      <div className="overflow-hidden rounded-[18px] bg-white text-black">
        {drinks.map((drink, index) => (
          <div className="grid gap-3 border-b border-black/6 p-4 last:border-b-0 xl:grid-cols-[56px_minmax(240px,1fr)_130px_260px]" key={drink.id}>
            <span className="text-lg font-black text-black/35">#{index + 1}</span>
            <div className="min-w-0">
              <strong className="block truncate text-xl">{drink.name}</strong>
              <p className="truncate text-sm font-semibold text-black/45">{drink.ingredients}</p>
            </div>
            <div className="flex items-center gap-3 xl:justify-end">
              <span className={["min-w-[62px] text-sm font-black", drink.isStopped ? "text-black/45" : "text-black"].join(" ")}>
                {drink.isStopped ? "В стопе" : "В меню"}
              </span>
              <button
                aria-label={drink.isStopped ? "Вернуть напиток в меню" : "Добавить напиток в стоп-лист"}
                aria-pressed={!drink.isStopped}
                className={[
                  "flex h-8 w-[58px] items-center rounded-full p-1 transition",
                  drink.isStopped ? "justify-start bg-black/18" : "justify-end bg-[#c7efad]",
                ].join(" ")}
                disabled={pendingDrinkId === drink.id}
                onClick={() => patchDrink(drink.id, { isStopped: !drink.isStopped })}
                type="button"
              >
                <span className="size-6 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button className="rounded-[9px] bg-black/6 px-3 py-2 text-sm font-bold disabled:opacity-50" disabled={pendingDrinkId === drink.id} onClick={() => patchDrink(drink.id, { move: "up" })} type="button">
                Выше
              </button>
              <button className="rounded-[9px] bg-black/6 px-3 py-2 text-sm font-bold disabled:opacity-50" disabled={pendingDrinkId === drink.id} onClick={() => patchDrink(drink.id, { move: "down" })} type="button">
                Ниже
              </button>
              <Link className="rounded-[9px] bg-[#c7efad] px-3 py-2 text-sm font-bold" href={`/admin/${slug}/drinks/${drink.id}`}>
                Править
              </Link>
              <button className="rounded-[9px] bg-[#ffc4c4] px-3 py-2 text-sm font-bold disabled:opacity-50" disabled={pendingDrinkId === drink.id} onClick={() => deleteDrink(drink.id)} type="button">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
