import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="flex min-h-[calc(100dvh-92px)] flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] sm:px-6">
      <div className="grid flex-1 place-items-center py-16 text-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/42">
            Пусто
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            В корзине пока ничего нет
          </h2>
          <p className="mx-auto mt-4 max-w-xs text-base leading-7 text-white/58">
            Вернитесь в меню и добавьте коктейли, которые нужно принести к столу.
          </p>
          <Link
            className="mt-7 inline-grid h-14 place-items-center rounded-full bg-white px-7 text-base font-semibold text-black transition active:scale-[0.98]"
            href="/"
          >
            Вернуться к меню
          </Link>
        </div>
      </div>
    </div>
  );
}
