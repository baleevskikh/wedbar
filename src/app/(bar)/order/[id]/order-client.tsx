"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { writeActiveOrderId } from "../../../cart-storage";
import type { Order } from "@/lib/types";

const steps = [
  { status: "pending", label: "Ожидает выполнения" },
  { status: "in_progress", label: "Выполняется" },
  { status: "delivering", label: "Доставляем" },
] as const;

export function OrderClient({ orderId, table }: { orderId: string; table: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isMissing, setIsMissing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const loadOrder = useCallback(async () => {
    const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
    if (!response.ok) {
      setIsMissing(true);
      writeActiveOrderId(null);
      return;
    }
    const data = (await response.json()) as { order: Order };
    setOrder(data.order);
    if (data.order.status === "delivering" || data.order.status === "rejected") {
      writeActiveOrderId(null);
    }
  }, [orderId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadOrder();
    });
    const poll = setInterval(loadOrder, 10000);
    const clock = setInterval(() => setNow(Date.now()), 30000);
    const events = new EventSource("/api/events");
    events.addEventListener("order.updated", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as { orderId?: number };
      if (String(payload.orderId) === orderId) {
        loadOrder();
      }
    });

    return () => {
      clearInterval(poll);
      clearInterval(clock);
      events.close();
    };
  }, [loadOrder, orderId]);

  const displayStatus = useMemo(() => {
    if (!order) {
      return "Загрузка";
    }
    if (order.status === "rejected") {
      return "Заказ отклонён";
    }
    if (order.status === "delivering" && order.readyAt) {
      const readyAt = new Date(order.readyAt).getTime();
      return now - readyAt >= 5 * 60 * 1000 ? "Готово" : "Доставляем";
    }
    return steps.find((step) => step.status === order.status)?.label ?? order.status;
  }, [now, order]);

  if (isMissing) {
    return (
      <main className="grid min-h-dvh place-items-center bg-black px-6 text-center text-white">
        <div>
          <h1 className="text-4xl font-black">Заказ не найден</h1>
          <Link className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 font-bold text-black" href={`/?table=${table}`}>
            Вернуться в меню
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-[calc(env(safe-area-inset-top)+18px)] text-white sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-white/62" href={`/?table=${table}`}>
          Меню
        </Link>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">Стол №{table}</span>
      </header>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
          Заказ #{order?.id ?? orderId}
        </p>
        <h1 className="mt-3 text-5xl font-black leading-none">{displayStatus}</h1>
        {order?.status === "rejected" ? (
          <p className="mt-5 rounded-2xl bg-[#ffc4c4] px-4 py-4 text-lg font-bold leading-7 text-black">
            {order.rejectReason}
          </p>
        ) : null}
      </section>

      <section className="mt-9 grid gap-3">
        {steps.map((step, index) => {
          const currentIndex = order ? Math.max(0, steps.findIndex((item) => item.status === order.status)) : 0;
          const isDone = order?.status === "delivering" || index <= currentIndex;
          return (
            <div
              className={[
                "rounded-2xl px-4 py-4 font-bold",
                isDone ? "bg-white text-black" : "bg-white/8 text-white/45",
              ].join(" ")}
              key={step.status}
            >
              {step.label}
            </div>
          );
        })}
      </section>

      <section className="mt-8 rounded-3xl bg-white p-4 text-black">
        <h2 className="text-xl font-black">Состав заказа</h2>
        <div className="mt-4 divide-y divide-black/8">
          {order?.items.map((item) => (
            <div className="flex items-center justify-between gap-4 py-3" key={item.drinkId}>
              <span className="font-bold">{item.drinkName}</span>
              <span className="rounded-full bg-black/8 px-3 py-1 text-sm font-black">{item.qty} шт.</span>
            </div>
          ))}
        </div>
        {order?.comment ? (
          <p className="mt-4 rounded-2xl bg-black/6 px-4 py-3 text-sm font-semibold">
            {order.comment}
          </p>
        ) : null}
      </section>

      {order?.status === "delivering" || order?.status === "rejected" ? (
        <Link
          className="mt-6 grid h-14 place-items-center rounded-2xl bg-[#c7efad] text-lg font-bold text-black"
          href={`/?table=${table}`}
        >
          Заказать ещё
        </Link>
      ) : null}
    </main>
  );
}
