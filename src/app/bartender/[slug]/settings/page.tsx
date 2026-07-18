"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { mediaUrl, type Drink } from "@/app/drinks";
import { readApiJson, staffHeaders } from "@/app/staff-api";

export default function BartenderSettingsPage() {
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
    const poll = setInterval(loadDrinks, 15000);
    const events = new EventSource("/api/events");
    events.addEventListener("menu.updated", loadDrinks);
    return () => {
      clearInterval(poll);
      events.close();
    };
  }, [loadDrinks]);

  async function toggleDrink(drink: Drink) {
    if (pendingDrinkId) {
      return;
    }

    setError(null);
    setPendingDrinkId(drink.id);
    try {
      const response = await fetch(`/api/drinks/${drink.id}`, {
        method: "PATCH",
        headers: staffHeaders(slug, "json"),
        body: JSON.stringify({ isStopped: !drink.isStopped }),
      });
      await readApiJson(response);
      await loadDrinks();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось обновить стоп-лист");
      void loadDrinks();
    } finally {
      setPendingDrinkId(null);
    }
  }

  return (
    <section className="h-dvh overflow-hidden bg-black p-4 pl-[10px] text-white">
      <div className="flex h-full flex-col rounded-[18px] bg-[#242424] p-6">
        <header className="shrink-0">
          <h1 className="text-[34px] font-black leading-none">Настройки</h1>
          <p className="mt-2 text-lg text-white/55">Стоп-лист напитков</p>
          {error ? (
            <p className="mt-4 rounded-xl bg-[#ffc4c4] px-4 py-3 font-bold text-black">{error}</p>
          ) : null}
        </header>

        <div className="mt-8 grid max-w-[620px] gap-3 overflow-auto">
          {drinks.map((drink) => (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-4 text-black" key={drink.id}>
              <div className="flex min-w-0 items-center gap-3">
                {drink.imagePath ? (
                  <Image
                    alt=""
                    className="size-12 shrink-0 rounded-[8px] bg-black/8 object-cover"
                    height={48}
                    src={mediaUrl(drink.imagePath)}
                    width={48}
                  />
                ) : (
                  <span className="size-12 shrink-0 rounded-[8px] bg-black/8" />
                )}
                <span className="truncate text-xl font-bold">{drink.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={["text-sm font-black", drink.isStopped ? "text-black/45" : "text-black"].join(" ")}>
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
                  onClick={() => toggleDrink(drink)}
                  type="button"
                >
                  <span className="size-6 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
