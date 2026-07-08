const summary = [
  { label: "Заказов", value: "128", trend: "+18 за час" },
  { label: "Порций", value: "312", trend: "2.4 на заказ" },
  { label: "Отклонено", value: "7", trend: "5.2%" },
  { label: "Активных столов", value: "24", trend: "из 28" },
];

const topDrinks = [
  { name: "Ruby Sour", qty: 68, color: "bg-[#ff5d62]" },
  { name: "Aperol Highball", qty: 54, color: "bg-[#ffa51a]" },
  { name: "Golden Collins", qty: 46, color: "bg-[#ffde59]" },
  { name: "Midnight Fizz", qty: 39, color: "bg-[#7bc5ff]" },
];

const timeline = [
  { label: "18:00", orders: 8 },
  { label: "18:30", orders: 14 },
  { label: "19:00", orders: 23 },
  { label: "19:30", orders: 31 },
  { label: "20:00", orders: 27 },
  { label: "20:30", orders: 19 },
];

const tables = [
  { table: 7, orders: 12, portions: 31 },
  { table: 12, orders: 10, portions: 28 },
  { table: 4, orders: 9, portions: 24 },
  { table: 18, orders: 8, portions: 20 },
  { table: 3, orders: 7, portions: 18 },
];

export default function AdminPage() {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-5 md:gap-5 md:px-6 md:py-6 xl:px-8">
      <header className="flex flex-col gap-4 rounded-[18px] bg-[#242424] p-5 sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c7efad]">
            WedBar Admin
          </p>
          <h1 className="mt-2 text-[34px] font-black leading-none sm:text-[44px] md:text-[56px]">
            Дашборд
          </h1>
        </div>
        <button
          className="h-12 rounded-[10px] bg-[#c7efad] px-5 text-base font-bold text-black"
          type="button"
        >
          Обновить
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article className="rounded-[16px] bg-white p-4 text-black md:p-5" key={item.label}>
            <p className="text-sm font-bold text-black/45">{item.label}</p>
            <strong className="mt-3 block text-[40px] font-black leading-none md:text-[48px]">
              {item.value}
            </strong>
            <p className="mt-3 text-sm font-semibold text-black/50">{item.trend}</p>
          </article>
        ))}
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[1.05fr_1.4fr] xl:grid-cols-[0.95fr_1.25fr_0.9fr]">
        <section className="rounded-[18px] bg-[#242424] p-5 md:p-6">
          <h2 className="text-2xl font-black">Топ напитков</h2>
          <div className="mt-6 space-y-5">
            {topDrinks.map((drink) => (
              <div key={drink.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`size-4 shrink-0 rounded-full ${drink.color}`} />
                    <span className="truncate text-lg font-bold">{drink.name}</span>
                  </div>
                  <span className="font-black">{drink.qty}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[#c7efad]"
                    style={{ width: `${Math.round((drink.qty / topDrinks[0].qty) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[18px] bg-white p-5 text-black md:p-6">
          <h2 className="text-2xl font-black">Заказы по времени</h2>
          <div className="mt-8 flex h-[260px] items-end gap-3 sm:gap-4">
            {timeline.map((point) => (
              <div className="flex h-full flex-1 flex-col justify-end gap-3" key={point.label}>
                <div
                  className="rounded-t-[12px] bg-[#c7efad]"
                  style={{ height: `${Math.max(18, (point.orders / 31) * 100)}%` }}
                />
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
            {tables.map((row) => (
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-4" key={row.table}>
                <strong className="text-xl">Стол №{row.table}</strong>
                <span className="text-sm font-semibold text-white/55">{row.orders} заказов</span>
                <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-black">
                  {row.portions}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
