const drinks = [
  { name: "Коктейль 1", stopped: false, color: "bg-[#ffa51a]" },
  { name: "Коктейль 2", stopped: true, color: "bg-[#ff5d62]" },
  { name: "Коктейль 3", stopped: false, color: "bg-[#c0c5ad]" },
  { name: "Коктейль 4", stopped: false, color: "bg-[#7bc5ff]" },
  { name: "Коктейль 5", stopped: false, color: "bg-[#ffde59]" },
];

export default function BartenderSettingsPage() {
  return (
    <section className="h-dvh overflow-hidden bg-black p-4 pl-[10px] text-white">
      <div className="flex h-full flex-col rounded-[18px] bg-[#242424] p-6">
        <header className="shrink-0">
          <h1 className="text-[34px] font-black leading-none">Настройки</h1>
          <p className="mt-2 text-lg text-white/55">Стоп-лист напитков</p>
        </header>

        <div className="mt-8 grid max-w-[620px] gap-3">
          {drinks.map((drink) => (
            <div
              className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-4 text-black"
              key={drink.name}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`size-5 shrink-0 rounded-full ${drink.color}`} />
                <span className="truncate text-xl font-bold">{drink.name}</span>
              </div>
              <button
                aria-pressed={drink.stopped}
                className={[
                  "flex h-8 w-[58px] items-center rounded-full p-1 transition",
                  drink.stopped ? "justify-end bg-[#ff5d62]" : "justify-start bg-[#dff1d6]",
                ].join(" ")}
                type="button"
              >
                <span className="size-6 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
