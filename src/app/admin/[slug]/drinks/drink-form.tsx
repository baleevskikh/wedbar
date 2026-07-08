"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { Drink } from "@/app/drinks";

const fieldClass =
  "mt-2 w-full rounded-[12px] border border-black/8 bg-[#f4f4f0] px-4 py-3 text-base font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-[#9bd67d] focus:bg-white";

export function DrinkForm({
  drink,
  slug,
}: {
  drink?: Drink;
  slug: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch(drink ? `/api/drinks/${drink.id}` : "/api/drinks", {
      method: drink ? "PATCH" : "POST",
      body: form,
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error?.message ?? "Не удалось сохранить напиток");
      setIsSaving(false);
      return;
    }

    router.push(`/admin/${slug}/drinks`);
    router.refresh();
  }

  return (
    <section className="mx-auto grid min-h-dvh w-full max-w-[1440px] gap-4 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_360px] md:px-6 md:py-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:px-8">
      <form className="rounded-[18px] bg-white p-5 text-black md:p-6" onSubmit={submit}>
        <header className="flex flex-col gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black/45">Меню</p>
            <h1 className="mt-2 text-[34px] font-black leading-none sm:text-[44px]">
              {drink ? "Редактировать напиток" : "Новый напиток"}
            </h1>
          </div>
          <button className="h-12 rounded-[10px] bg-[#c7efad] px-5 text-base font-bold text-black disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "Сохраняем" : "Сохранить"}
          </button>
        </header>

        {error ? <p className="mt-4 rounded-xl bg-[#ffc4c4] px-4 py-3 font-bold">{error}</p> : null}

        <div className="mt-6 grid gap-5">
          <label className="block">
            <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">Название</span>
            <input className={fieldClass} defaultValue={drink?.name} name="name" placeholder="Ruby Sour" required type="text" />
          </label>

          <label className="block">
            <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">Короткое описание</span>
            <textarea className={`${fieldClass} min-h-[112px] resize-none`} defaultValue={drink?.description} name="description" placeholder="Ягодная кислинка, сухой финиш и плотная пена." />
          </label>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">Состав для гостей</span>
              <textarea className={`${fieldClass} min-h-[150px] resize-none`} defaultValue={drink?.ingredients} name="ingredients" placeholder="Gin, raspberry, lemon, aquafaba" />
            </label>
            <label className="block">
              <span className="text-sm font-black uppercase tracking-[0.08em] text-black/55">Рецепт для бармена</span>
              <textarea className={`${fieldClass} min-h-[150px] resize-none`} defaultValue={drink?.recipe} name="recipe" placeholder="45 мл gin, 25 мл lemon, 20 мл syrup..." />
            </label>
          </div>

          <label className="grid min-h-[150px] place-items-center rounded-[16px] border-2 border-dashed border-black/12 bg-[#f4f4f0] p-6 text-center">
            <input accept="image/jpeg,image/png,image/webp" className="sr-only" name="image" required={!drink} type="file" />
            <span>
              <strong className="block text-xl font-black">Загрузить изображение</strong>
              <span className="mt-2 block text-sm font-semibold text-black/45">jpeg, png, webp</span>
            </span>
          </label>

          <label className="grid min-h-[120px] place-items-center rounded-[16px] border-2 border-dashed border-black/12 bg-[#f4f4f0] p-6 text-center">
            <input accept="video/mp4,video/webm" className="sr-only" name="video" type="file" />
            <span>
              <strong className="block text-xl font-black">Видео, опционально</strong>
              <span className="mt-2 block text-sm font-semibold text-black/45">mp4 или webm до 50 МБ</span>
            </span>
          </label>
        </div>
      </form>

      <aside className="rounded-[18px] bg-[#242424] p-5 md:p-6">
        <h2 className="text-2xl font-black">После сохранения</h2>
        <div className="mt-4 rounded-[16px] bg-white p-4 text-black">
          <ul className="space-y-2 text-sm font-semibold">
            <li>Появится или обновится в меню гостей</li>
            <li>Будет доступен в стоп-листе</li>
            <li>Рецепт увидит только бармен</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
