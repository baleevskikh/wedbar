"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { mediaUrl } from "../../../drinks";
import type { Order } from "@/lib/types";

const steps = [
  { status: "pending", label: "Приняли заказ" },
  { status: "in_progress", label: "Готовим напитки" },
  { status: "delivering", label: "Несём к столу" },
] as const;

function formatOrderDate(value: string | null | undefined) {
  if (!value) {
    return "Уточняется";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPortionsLabel(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "порций";
  }
  if (last === 1) {
    return "порция";
  }
  if (last >= 2 && last <= 4) {
    return "порции";
  }
  return "порций";
}

export function OrderClient({ orderId, table }: { orderId: string; table: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isMissing, setIsMissing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const loadOrder = useCallback(async () => {
    const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
    if (!response.ok) {
      setIsMissing(true);
      return;
    }
    const data = (await response.json()) as { order: Order };
    setOrder(data.order);
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

  const currentIndex = useMemo(() => {
    if (!order || order.status === "rejected") {
      return -1;
    }
    return Math.max(0, steps.findIndex((step) => step.status === order.status));
  }, [order]);

  const totalPortions = useMemo(
    () => order?.items.reduce((total, item) => total + item.qty, 0) ?? 0,
    [order],
  );

  const heroCopy = useMemo(() => {
    if (!order) {
      return {
        title: "Проверяем заказ",
        subtitle: "Синхронизируем статус",
      };
    }
    if (order.status === "rejected") {
      return {
        title: "Заказ отклонён",
        subtitle: "Бармен оставил комментарий ниже",
      };
    }
    if (order.status === "delivering" && order.readyAt && now - new Date(order.readyAt).getTime() >= 5 * 60 * 1000) {
      return {
        title: "Заказ доставлен",
        subtitle: "Можно заказать ещё",
      };
    }
    if (order.status === "delivering") {
      return {
        title: "Скоро принесём",
        subtitle: "Заказ уже в пути",
      };
    }
    if (order.status === "in_progress") {
      return {
        title: "Осталось ~10 минут",
        subtitle: "Бармен уже готовит",
      };
    }
    return {
      title: "Осталось ~15 минут",
      subtitle: "Заказ уже в очереди",
    };
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
    <main className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] text-white [-webkit-overflow-scrolling:touch] sm:px-6">
      <header className="-mx-4 sticky top-0 z-20 border-b border-white/10 bg-black/90 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)] shadow-[0_16px_32px_rgba(0,0,0,0.32)] backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="relative flex h-14 items-center justify-between">
          <Link
            className="relative z-10 inline-grid h-11 w-11 items-center justify-items-start rounded-full text-white/72 transition active:scale-[0.98] active:bg-white/10 active:text-white"
            href={`/?table=${table}`}
            aria-label="Вернуться к меню"
          >
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M19 12H5m0 0 6-6m-6 6 6 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </Link>

          <div className="pointer-events-none absolute inset-x-12 top-1/2 -translate-y-1/2 text-center">
            <p className="text-base font-semibold leading-5 text-white">Заказ №{order?.id ?? orderId}</p>
            <p className="mt-0.5 text-sm font-medium leading-4 text-white/48">
              К столу №{order?.tableNumber ?? table}
            </p>
          </div>

          <div className="h-11 w-11" aria-hidden="true" />
        </div>
      </header>

      <section className="mt-5 border-b border-white/16 pb-5">
        <h1 className="text-[32px] font-black leading-[1.05]">{heroCopy.title}</h1>
        <p className="mt-1 text-sm font-bold text-white/86">{heroCopy.subtitle}</p>

        <div className="mt-6 grid grid-cols-3 gap-2.5" aria-label={displayStatus}>
          {steps.map((step, index) => {
            const isComplete = index < currentIndex || order?.status === "delivering";
            const isCurrent = index === currentIndex && !isComplete;

            return (
              <div
                className={[
                  "relative h-1.5 overflow-hidden rounded-full",
                  isComplete ? "bg-white" : "bg-white/24",
                ].join(" ")}
                key={step.status}
                title={step.label}
              >
                {isCurrent ? <div className="order-progress-runner" /> : null}
              </div>
            );
          })}
        </div>

        {order?.status === "rejected" ? (
          <p className="mt-5 bg-[#ffc4c4] px-4 py-4 text-base font-bold leading-6 text-black">
            {order.rejectReason ?? "Заказ не получится выполнить."}
          </p>
        ) : null}
      </section>

      <section className="border-b border-white/16 py-3.5">
        <div className="divide-y divide-white/10">
          {order?.items.map((item) => (
            <article className="grid grid-cols-[80px_1fr] gap-3 py-3 first:pt-0 last:pb-0" key={item.drinkId}>
              <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-white/8">
                {item.imagePath ? (
                  <Image
                    src={mediaUrl(item.imagePath)}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="grid min-w-0 content-between gap-4 py-0.5">
                <div>
                  <h2 className="line-clamp-2 text-base font-semibold leading-5">{item.drinkName}</h2>
                </div>
                <p className="justify-self-end text-base font-black">{item.qty} порц.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-white/16 py-7 text-center">
        <p className="text-base font-bold text-white/48">Итого</p>
        <p className="mt-1 text-[32px] font-black leading-none">
          {totalPortions} {formatPortionsLabel(totalPortions)}
        </p>
      </section>

      <section className="divide-y divide-white/16 border-b border-white/16">
        <div className="py-2.5">
          <p className="text-sm font-bold text-white/48">Время заказа</p>
          <p className="mt-0.5 text-sm font-bold">{formatOrderDate(order?.createdAt)}</p>
        </div>
        {order?.comment ? (
          <div className="py-2.5">
            <p className="text-sm font-bold text-white/48">Комментарий</p>
            <p className="mt-0.5 text-sm font-bold">{order.comment}</p>
          </div>
        ) : null}
      </section>

      {order?.status === "delivering" || order?.status === "rejected" ? (
        <Link
          className="mt-5 grid h-14 place-items-center rounded-lg bg-white text-lg font-bold text-black"
          href={`/?table=${table}`}
        >
          Заказать ещё
        </Link>
      ) : null}
    </main>
  );
}
