const drinks = [
  {
    name: "Ruby Sour",
    description: "Ягодная кислинка, сухой финиш и плотная пена.",
    ingredients: "Gin, raspberry, lemon, aquafaba",
    status: "В меню",
    orders: 68,
    color: "bg-[#ff5d62]",
  },
  {
    name: "Aperol Highball",
    description: "Легкий аперитив с апельсином и содовой.",
    ingredients: "Aperol, orange, prosecco, soda",
    status: "В меню",
    orders: 54,
    color: "bg-[#ffa51a]",
  },
  {
    name: "Golden Collins",
    description: "Солнечный long drink с лимоном и медом.",
    ingredients: "Gin, lemon, honey, soda",
    status: "В меню",
    orders: 46,
    color: "bg-[#ffde59]",
  },
  {
    name: "Midnight Fizz",
    description: "Холодный цитрус, минералы и мягкая сладость.",
    ingredients: "Vodka, blue curacao, lime, tonic",
    status: "В стопе",
    orders: 39,
    color: "bg-[#7bc5ff]",
  },
  {
    name: "Garden Tonic",
    description: "Травяной микс с огурцом и сухим тоником.",
    ingredients: "Gin, cucumber, herbs, tonic",
    status: "Черновик",
    orders: 0,
    color: "bg-[#c7efad]",
  },
];

export default async function DrinksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-5 md:px-6 md:py-6 xl:px-8">
      <header className="flex flex-col gap-4 rounded-[18px] bg-[#242424] p-5 sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c7efad]">
            Меню гостей
          </p>
          <h1 className="mt-2 text-[34px] font-black leading-none sm:text-[44px] md:text-[56px]">
            Напитки
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            className="h-12 rounded-[10px] bg-white/8 px-4 text-sm font-bold text-white"
            type="button"
          >
            Сортировка
          </button>
          <a
            className="grid h-12 place-items-center rounded-[10px] bg-[#c7efad] px-5 text-base font-bold text-black"
            href={`/admin/${slug}/drinks/new`}
          >
            Добавить
          </a>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:hidden">
        {drinks.map((drink, index) => (
          <DrinkCard drink={drink} index={index} key={drink.name} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[18px] bg-white text-black xl:block">
        <div className="grid grid-cols-[72px_minmax(240px,1fr)_minmax(260px,1fr)_130px_130px_180px] border-b border-black/8 px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-black/45">
          <span>№</span>
          <span>Напиток</span>
          <span>Состав</span>
          <span>Статус</span>
          <span>Порций</span>
          <span className="text-right">Действия</span>
        </div>

        {drinks.map((drink, index) => (
          <div
            className="grid grid-cols-[72px_minmax(240px,1fr)_minmax(260px,1fr)_130px_130px_180px] items-center border-b border-black/6 px-5 py-4 last:border-b-0"
            key={drink.name}
          >
            <span className="text-lg font-black text-black/35">{index + 1}</span>
            <div className="flex min-w-0 items-center gap-3">
              <span className={`size-11 shrink-0 rounded-[12px] ${drink.color}`} />
              <div className="min-w-0">
                <strong className="block truncate text-xl">{drink.name}</strong>
                <p className="truncate text-sm font-semibold text-black/45">{drink.description}</p>
              </div>
            </div>
            <p className="truncate pr-6 text-sm font-semibold text-black/55">{drink.ingredients}</p>
            <StatusBadge status={drink.status} />
            <strong className="text-lg">{drink.orders}</strong>
            <div className="flex justify-end gap-2">
              <button className="rounded-[9px] bg-black/6 px-3 py-2 text-sm font-bold" type="button">
                Выше
              </button>
              <button className="rounded-[9px] bg-[#c7efad] px-3 py-2 text-sm font-bold" type="button">
                Править
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DrinkCard({
  drink,
  index,
}: {
  drink: (typeof drinks)[number];
  index: number;
}) {
  return (
    <article className="rounded-[18px] bg-white p-4 text-black">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className={`size-12 shrink-0 rounded-[13px] ${drink.color}`} />
          <div className="min-w-0">
            <p className="text-sm font-black text-black/35">#{index + 1}</p>
            <h2 className="truncate text-2xl font-black leading-tight">{drink.name}</h2>
          </div>
        </div>
        <StatusBadge status={drink.status} />
      </div>
      <p className="mt-4 text-sm font-semibold text-black/55">{drink.description}</p>
      <p className="mt-3 text-sm font-bold text-black/75">{drink.ingredients}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-black/6 px-3 py-1 text-sm font-black">
          {drink.orders} порций
        </span>
        <div className="flex gap-2">
          <button className="rounded-[9px] bg-black/6 px-3 py-2 text-sm font-bold" type="button">
            Выше
          </button>
          <button className="rounded-[9px] bg-[#c7efad] px-3 py-2 text-sm font-bold" type="button">
            Править
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "В стопе"
      ? "bg-[#ffc4c4] text-black"
      : status === "Черновик"
        ? "bg-black/8 text-black/55"
        : "bg-[#dff1d6] text-black";

  return (
    <span className={`w-fit rounded-full px-3 py-1 text-sm font-black ${className}`}>
      {status}
    </span>
  );
}
