"use client";

import Link from "next/link";

export function CartHeader({
  onClearCart,
  table,
}: {
  onClearCart: () => void;
  table: number;
}) {
  return (
    <header className="sticky top-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.92),rgba(0,0,0,0.72)_72%,rgba(0,0,0,0))] px-4 pb-5 pt-[calc(env(safe-area-inset-top)+18px)] backdrop-blur-sm sm:px-6">
      <div className="relative flex min-h-11 items-center justify-between">
        <Link
          className="relative z-10 inline-flex min-h-11 items-center text-white/72 transition active:scale-[0.98] active:text-white"
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
          <p className="text-base font-semibold leading-5 text-white">К столу №{table}</p>
          <p className="mt-0.5 text-sm font-medium leading-4 text-white/48">
            ~5-15 мин
          </p>
        </div>

        <button
          className="relative z-10 inline-flex min-h-11 items-center text-white/72 transition active:scale-[0.98] active:text-white"
          onClick={onClearCart}
          type="button"
          aria-label="Очистить корзину"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
