const fieldClass =
  "mt-2 w-full rounded-[12px] border border-black/8 bg-[#f4f4f0] px-4 py-3 text-base font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-[#9bd67d] focus:bg-white";

export default function NewDrinkPage() {
  return (
    <section className="mx-auto grid min-h-dvh w-full max-w-[1440px] gap-4 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_360px] md:px-6 md:py-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:px-8">
      <form className="rounded-[18px] bg-white p-5 text-black md:p-6">
        <header className="flex flex-col gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
              Меню
            </p>
            <h1 className="mt-2 text-[34px] font-black leading-none sm:text-[44px]">
              Новый напиток
            </h1>
          </div>
          <button
            className="h-12 rounded-[10px] bg-[#c7efad] px-5 text-base font-bold text-black"
            type="button"
          >
            Сохранить
          </button>
        </header>

        <div className="mt-6 grid gap-5">
          <label className="block">
            <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">
              Название
            </span>
            <input className={fieldClass} placeholder="Ruby Sour" type="text" />
          </label>

          <label className="block">
            <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">
              Короткое описание
            </span>
            <textarea
              className={`${fieldClass} min-h-[112px] resize-none`}
              placeholder="Ягодная кислинка, сухой финиш и плотная пена."
            />
          </label>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">
                Состав для гостей
              </span>
              <textarea
                className={`${fieldClass} min-h-[150px] resize-none`}
                placeholder="Gin, raspberry, lemon, aquafaba"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">
                Рецепт для бармена
              </span>
              <textarea
                className={`${fieldClass} min-h-[150px] resize-none`}
                placeholder="45 мл gin, 25 мл lemon, 20 мл syrup..."
              />
            </label>
          </div>

          <label className="grid min-h-[190px] place-items-center rounded-[16px] border-2 border-dashed border-black/12 bg-[#f4f4f0] p-6 text-center">
            <input accept="image/jpeg,image/png,image/webp,video/mp4" className="sr-only" type="file" />
            <span>
              <strong className="block text-xl font-black">Загрузить медиа</strong>
              <span className="mt-2 block text-sm font-semibold text-black/45">
                jpeg, png, webp или mp4 до 50 МБ
              </span>
            </span>
          </label>
        </div>
      </form>

      <aside className="rounded-[18px] bg-[#242424] p-5 md:p-6">
        <h2 className="text-2xl font-black">Превью</h2>
        <div className="mt-5 overflow-hidden rounded-[18px] bg-[#c7efad] p-[10px] text-black">
          <div className="flex aspect-[3/4] flex-col rounded-[12px] bg-white/45 p-4">
            <div>
              <h3 className="text-[30px] font-black leading-none">Ruby Sour</h3>
              <p className="mt-2 text-lg leading-tight">Ягодная кислинка и сухой финиш.</p>
            </div>
            <div className="mt-auto rounded-[10px] bg-black/8 px-4 py-3 text-center text-lg font-bold">
              В ленте гостей
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[16px] bg-white p-4 text-black">
          <p className="text-sm font-bold text-black/45">После сохранения</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            <li>Появится в меню гостей</li>
            <li>Будет доступен в стоп-листе</li>
            <li>Рецепт увидит только бармен</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
