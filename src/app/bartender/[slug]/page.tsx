type OrderItem = {
  color: string;
  name: string;
  qty: number;
};

type OrderCard = {
  id: string;
  table: number;
  minutesAgo: number;
  status: "in_progress" | "pending";
  items: OrderItem[];
};

const orders: OrderCard[] = [
  {
    id: "37",
    table: 7,
    minutesAgo: 8,
    status: "in_progress",
    items: [
      { color: "bg-[#ffa51a]", name: "Коктейль 1", qty: 3 },
      { color: "bg-[#ff5d62]", name: "Коктейль 2", qty: 4 },
      { color: "bg-[#c0c5ad]", name: "Коктейль 3", qty: 1 },
    ],
  },
  {
    id: "38",
    table: 12,
    minutesAgo: 2,
    status: "pending",
    items: [
      { color: "bg-[#ffa51a]", name: "Коктейль 1", qty: 2 },
      { color: "bg-[#7bc5ff]", name: "Коктейль 4", qty: 1 },
      { color: "bg-[#ffde59]", name: "Коктейль 5", qty: 2 },
    ],
  },
];

const slots = Array.from({ length: 8 }, (_, index) => orders[index] ?? null);

export default function BartenderPage() {
  return (
    <section className="grid h-dvh grid-cols-4 grid-rows-2 gap-[10px] p-4 pl-[10px]">
      {slots.map((order, index) =>
        order ? (
          <OrderTicket key={order.id} order={order} />
        ) : (
          <EmptySlot key={`empty-${index}`} />
        ),
      )}
    </section>
  );
}

function OrderTicket({ order }: { order: OrderCard }) {
  const isAccepted = order.status === "in_progress";

  return (
    <article
      className={[
        "flex min-h-0 flex-col rounded-[18px] p-[10px]",
        isAccepted ? "bg-[#c7efad]" : "bg-white",
      ].join(" ")}
    >
      <header className="shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[33px] font-black leading-[0.9] tracking-normal">
              Стол №{order.table}
            </h1>
            <p className="mt-2 text-[22px] leading-none">#{order.id}</p>
          </div>
          <time className="rounded-full bg-black/6 px-3 py-1 text-[13px] font-semibold text-black/55">
            {order.minutesAgo} мин
          </time>
        </div>
      </header>

      <ul className="mt-5 space-y-3">
        {order.items.map((item) => (
          <li className="flex items-center gap-[10px]" key={item.name}>
            <span className={`size-5 rounded-full ${item.color}`} />
            <span className="min-w-0 text-[17px] font-semibold leading-none">
              {item.name} <strong>{item.qty} шт.</strong>
            </span>
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex shrink-0 gap-2">
        {!isAccepted && (
          <button
            aria-label="Отклонить заказ"
            className="grid size-[52px] place-items-center rounded-[9px] bg-[#ffc4c4] text-black"
            type="button"
          >
            <span className="relative block size-6 rounded-full border-[3px] border-black before:absolute before:left-1/2 before:top-1/2 before:h-[3px] before:w-[25px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:rounded-full before:bg-black" />
          </button>
        )}
        <button
          className={[
            "h-[52px] flex-1 rounded-[9px] text-[18px] font-medium",
            isAccepted ? "bg-black/8" : "bg-[#e4f6da]",
          ].join(" ")}
          type="button"
        >
          {isAccepted ? "Готово" : "Принять"}
        </button>
      </footer>
    </article>
  );
}

function EmptySlot() {
  return <div className="min-h-0 rounded-[18px] bg-[#242424]" />;
}
