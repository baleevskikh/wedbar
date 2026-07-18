"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { readApiJson, staffHeaders } from "@/app/staff-api";
import type { Stats } from "@/lib/types";

const emptyStats: Stats = {
  summary: { totalOrders: 0, totalPortions: 0, rejectedOrders: 0, activeTables: 0 },
  topDrinks: [],
  timeline: [],
  tables: [],
};

export default function AdminPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stats", {
        cache: "no-store",
        headers: staffHeaders(slug),
      });
      const data = await readApiJson<{ stats: Stats }>(response);
      setStats(data.stats);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось обновить статистику");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStats();
    });
    const poll = setInterval(loadStats, 15000);
    const events = new EventSource("/api/events");
    events.addEventListener("order.updated", loadStats);
    events.addEventListener("order.created", loadStats);
    return () => {
      clearInterval(poll);
      events.close();
    };
  }, [loadStats]);

  const summary = [
    { label: "Заказов", value: stats.summary.totalOrders, trend: "доставляемые" },
    { label: "Порций", value: stats.summary.totalPortions, trend: "готовые заказы" },
    { label: "Отклонено", value: stats.summary.rejectedOrders, trend: "за вечер" },
    { label: "Активных столов", value: stats.summary.activeTables, trend: "с заказами" },
  ];
  const maxTimeline = Math.max(1, ...stats.timeline.map((point) => point.orders));
  const maxTop = Math.max(1, ...stats.topDrinks.map((drink) => drink.portions));

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-5 md:gap-5 md:px-6 md:py-6 xl:px-8">
      <header className="flex flex-col gap-4 rounded-[18px] bg-[#242424] p-5 sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c7efad]">WedBar Admin</p>
          <h1 className="mt-2 text-[34px] font-black leading-none sm:text-[44px] md:text-[56px]">Дашборд</h1>
        </div>
        <button className="h-12 rounded-[10px] bg-[#c7efad] px-5 text-base font-bold text-black disabled:opacity-60" disabled={isLoading} onClick={loadStats} type="button">
          {isLoading ? "Обновляем" : "Обновить"}
        </button>
      </header>
      {error ? <p className="rounded-xl bg-[#ffc4c4] px-4 py-3 font-bold text-black">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article className="rounded-[16px] bg-white p-4 text-black md:p-5" key={item.label}>
            <p className="text-sm font-bold text-black/45">{item.label}</p>
            <strong className="mt-3 block text-[40px] font-black leading-none md:text-[48px]">{item.value}</strong>
            <p className="mt-3 text-sm font-semibold text-black/50">{item.trend}</p>
          </article>
        ))}
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[1.05fr_1.4fr] xl:grid-cols-[0.95fr_1.25fr_0.9fr]">
        <section className="rounded-[18px] bg-[#242424] p-5 md:p-6">
          <h2 className="text-2xl font-black">Топ напитков</h2>
          <div className="mt-6 space-y-5">
            {stats.topDrinks.map((drink) => (
              <div key={drink.drinkId}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-lg font-bold">{drink.name}</span>
                  <span className="font-black">{drink.portions}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[#c7efad]" style={{ width: `${Math.round((drink.portions / maxTop) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[18px] bg-white p-5 text-black md:p-6">
          <h2 className="text-2xl font-black">Заказы по времени</h2>
          <div className="mt-8 flex h-[260px] items-end gap-3 sm:gap-4">
            {stats.timeline.map((point) => (
              <div className="flex h-full flex-1 flex-col justify-end gap-3" key={point.label}>
                <div className="rounded-t-[12px] bg-[#c7efad]" style={{ height: `${Math.max(18, (point.orders / maxTimeline) * 100)}%` }} />
                <div className="text-center">
                  <p className="text-sm font-black">{point.orders}</p>
                  <p className="text-xs font-semibold text-black/45">{point.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[18px] bg-[#242424] p-5 md:p-6 lg:col-span-2 xl:col-span-1">
          <h2 className="text-2xl font-black">Активность столов</h2>
          <div className="mt-5 divide-y divide-white/8">
            {stats.tables.map((row) => (
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-4" key={row.tableNumber}>
                <strong className="text-xl">Стол №{row.tableNumber}</strong>
                <span className="text-sm font-semibold text-white/55">{row.orders} заказов</span>
                <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-black">{row.portions}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
