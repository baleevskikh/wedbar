"use client";

import { useEffect, useState } from "react";

import type { Order } from "@/lib/types";

export default function BartenderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [queued, setQueued] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [recipe, setRecipe] = useState<{ name: string; text: string } | null>(null);
  const [rejecting, setRejecting] = useState<Order | null>(null);

  async function loadOrders() {
    const response = await fetch("/api/orders?active=1", { cache: "no-store" });
    const data = (await response.json()) as { orders: Order[]; queued: number };
    setOrders(data.orders);
    setQueued(data.queued);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadOrders();
    });
    const clock = setInterval(() => setNow(Date.now()), 30000);
    const events = new EventSource("/api/events");
    events.addEventListener("order.created", loadOrders);
    events.addEventListener("order.updated", loadOrders);
    return () => {
      clearInterval(clock);
      events.close();
    };
  }, []);

  async function patchOrder(orderId: number, body: unknown) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    loadOrders();
  }

  const slots = Array.from({ length: 6 }, (_, index) => orders[index] ?? null);

  return (
    <section className="grid h-dvh grid-cols-3 grid-rows-2 gap-[10px] p-4 pl-[10px]">
      {queued > 0 ? (
        <div className="fixed right-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-sm font-black text-black">
          В очереди ещё {queued}
        </div>
      ) : null}

      {slots.map((order, index) =>
        order ? (
          <OrderTicket
            key={order.id}
            onAccept={() => patchOrder(order.id, { action: "accept" })}
            onReady={() => patchOrder(order.id, { action: "ready" })}
            onRecipe={setRecipe}
            onReject={() => setRejecting(order)}
            now={now}
            order={order}
          />
        ) : (
          <EmptySlot key={`empty-${index}`} />
        ),
      )}

      {recipe ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/72 p-6">
          <div className="max-w-lg rounded-[18px] bg-white p-6 text-black">
            <h2 className="text-3xl font-black">{recipe.name}</h2>
            <p className="mt-4 whitespace-pre-wrap text-lg leading-7">{recipe.text || "Рецепт не заполнен"}</p>
            <button className="mt-6 rounded-[10px] bg-black px-5 py-3 font-bold text-white" onClick={() => setRecipe(null)} type="button">
              Закрыть
            </button>
          </div>
        </div>
      ) : null}

      {rejecting ? (
        <RejectDialog
          onClose={() => setRejecting(null)}
          onSubmit={(stopDrinkIds, rejectReason) => {
            patchOrder(rejecting.id, { action: "reject", stopDrinkIds, rejectReason });
            setRejecting(null);
          }}
        />
      ) : null}
    </section>
  );
}

function OrderTicket({
  onAccept,
  onReady,
  onRecipe,
  onReject,
  now,
  order,
}: {
  onAccept: () => void;
  onReady: () => void;
  onRecipe: (recipe: { name: string; text: string }) => void;
  onReject: () => void;
  now: number;
  order: Order;
}) {
  const isAccepted = order.status === "in_progress";
  const minutesAgo = Math.max(0, Math.floor((now - new Date(order.createdAt).getTime()) / 60000));

  return (
    <article className={["flex min-h-0 flex-col rounded-[18px] p-[10px]", isAccepted ? "bg-[#c7efad]" : "bg-white"].join(" ")}>
      <header className="shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[33px] font-black leading-[0.9] tracking-normal">Стол №{order.tableNumber}</h1>
            <p className="mt-2 text-[22px] leading-none">#{order.id}</p>
          </div>
          <time className="rounded-full bg-black/6 px-3 py-1 text-[13px] font-semibold text-black/55">
            {minutesAgo} мин
          </time>
        </div>
      </header>

      <ul className="mt-5 space-y-3 overflow-hidden">
        {order.items.map((item) => (
          <li key={item.drinkId}>
            <button
              className="flex w-full items-center gap-[10px] text-left"
              onClick={() => onRecipe({ name: item.drinkName, text: item.recipe })}
              type="button"
            >
              <span className="size-5 rounded-full bg-black/12" />
              <span className="min-w-0 text-[17px] font-semibold leading-none">
                {item.drinkName} <strong>{item.qty} шт.</strong>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {order.comment ? (
        <p className="mt-4 rounded-[10px] bg-black/8 px-3 py-2 text-sm font-bold leading-5">
          {order.comment}
        </p>
      ) : null}

      <footer className="mt-auto flex shrink-0 gap-2">
        <button
          className="h-[52px] flex-1 rounded-[9px] bg-[#ffc4c4] text-[18px] font-medium text-black"
          onClick={onReject}
          type="button"
        >
          Отменить
        </button>
        <button
          className={["h-[52px] flex-1 rounded-[9px] text-[18px] font-medium", isAccepted ? "bg-black/8" : "bg-[#e4f6da]"].join(" ")}
          onClick={isAccepted ? onReady : onAccept}
          type="button"
        >
          {isAccepted ? "Готово" : "Принять"}
        </button>
      </footer>
    </article>
  );
}

function RejectDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (stopDrinkIds: string[], rejectReason: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const canSubmit = rejectReason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/72 p-6">
      <div className="w-full max-w-lg rounded-[18px] bg-white p-6 text-black">
        <h2 className="text-3xl font-black">Отменить заказ</h2>
        <label className="mt-5 block">
          <span className="text-sm font-black uppercase text-black/45">Комментарий отмены</span>
          <textarea
            className="mt-2 min-h-[112px] w-full resize-none rounded-xl border border-black/10 bg-black/6 px-4 py-3 text-base font-bold outline-none transition placeholder:text-black/35 focus:border-black/30 focus:bg-white"
            maxLength={500}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Напишите причину отмены для гостя"
            value={rejectReason}
          />
        </label>
        <div className="mt-6 flex gap-2">
          <button className="h-12 flex-1 rounded-[10px] bg-black/8 font-bold" onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={[
              "h-12 flex-1 rounded-[10px] font-bold text-white transition",
              canSubmit ? "bg-black" : "cursor-not-allowed bg-black/25",
            ].join(" ")}
            disabled={!canSubmit}
            onClick={() => onSubmit([], rejectReason.trim())}
            type="button"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptySlot() {
  return <div className="min-h-0 rounded-[18px] bg-[#242424]" />;
}
