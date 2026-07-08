"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  getServerCartSnapshot,
  readCart,
  subscribeCart,
  writeCart,
} from "../cart-storage";
import { drinks } from "../drinks";

export default function CartPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const quantities = useSyncExternalStore(
    subscribeCart,
    readCart,
    getServerCartSnapshot,
  );
  const selectedItems = drinks
    .map((drink) => ({
      drink,
      qty: quantities[drink.id] ?? 0,
    }))
    .filter((item) => item.qty > 0);

  function updateQuantity(id: string, nextQty: number) {
    setIsSubmitted(false);
    const current = readCart();
    const next = { ...current };

    if (nextQty > 0) {
      next[id] = nextQty;
    } else {
      delete next[id];
    }

    writeCart(next);
  }

  function submitOrderPreview() {
    setIsSubmitted(true);
  }

  function clearCart() {
    setIsSubmitted(false);
    writeCart({});
  }

  return (
    <main className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black text-white">
      <CartHeader onClearCart={clearCart} />

      {selectedItems.length > 0 ? (
        <>
          <div className="mx-auto flex min-h-[calc(100dvh-190px)] max-w-md flex-col px-4 pb-5 sm:px-6">
            <div className="space-y-3 pb-5">
              {selectedItems.map(({ drink, qty }) => (
                <article
                  className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/10 pb-3"
                  key={drink.id}
                >
                  <div className="grid min-w-0 grid-cols-[82px_1fr] gap-4">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/8">
                      <Image
                        src={drink.image}
                        alt=""
                        fill
                        sizes="82px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold leading-6">
                        {drink.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/62">
                        {drink.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-h-full flex-col items-end justify-between gap-3">
                    <button
                      className="text-2xl leading-none text-white/56 transition active:scale-[0.96] active:text-white"
                      onClick={() => updateQuantity(drink.id, 0)}
                      type="button"
                      aria-label={`Удалить ${drink.name}`}
                    >
                      ×
                    </button>

                    <div className="grid h-9 w-28 grid-cols-3 overflow-hidden rounded-full bg-white text-black">
                      <button
                        className="text-xl text-black/62 transition active:bg-black/10"
                        onClick={() => updateQuantity(drink.id, qty - 1)}
                        type="button"
                        aria-label={`Уменьшить количество ${drink.name}`}
                      >
                        −
                      </button>
                      <span className="grid place-items-center text-sm font-semibold">
                        {qty}
                      </span>
                      <button
                        className="text-xl transition active:bg-black/10"
                        onClick={() => updateQuantity(drink.id, qty + 1)}
                        type="button"
                        aria-label={`Увеличить количество ${drink.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <footer className="sticky bottom-0 z-20 w-full bg-white/[0.08] px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 backdrop-blur-md sm:px-6">
            <div className="mx-auto max-w-md">
              <SlideToOrder onComplete={submitOrderPreview} />
              {isSubmitted ? (
                <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-5 text-black">
                  Заказ собран. Подключение отправки в API будет следующим
                  шагом.
                </p>
              ) : null}
            </div>
          </footer>
        </>
      ) : (
        <div className="mx-auto flex min-h-[calc(100dvh-92px)] max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] sm:px-6">
          <div className="grid flex-1 place-items-center py-16 text-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/42">
                Пусто
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                В корзине пока ничего нет
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-base leading-7 text-white/58">
                Вернитесь в меню и добавьте коктейли, которые нужно принести к
                столу.
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
      )}
    </main>
  );
}

function CartHeader({ onClearCart }: { onClearCart: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.92),rgba(0,0,0,0.72)_72%,rgba(0,0,0,0))] px-4 pb-5 pt-[calc(env(safe-area-inset-top)+18px)] backdrop-blur-sm sm:px-6">
      <div className="relative mx-auto flex min-h-11 max-w-md items-center justify-between">
        <Link
          className="relative z-10 inline-flex min-h-11 items-center text-white/72 transition active:scale-[0.98] active:text-white"
          href="/"
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
          <p className="text-base font-semibold leading-5 text-white">К столу №N</p>
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

function SlideToOrder({ onComplete }: { onComplete: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [knobOffset, setKnobOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function updateProgress(clientX: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const nextProgress = ((clientX - rect.left) / rect.width) * 100;
    const clampedProgress = Math.min(Math.max(nextProgress, 0), 100);

    setProgress(clampedProgress);
    setKnobOffset(((rect.width - 64) * clampedProgress) / 100);
  }

  function completeIfReady() {
    if (progress >= 84) {
      setProgress(100);
      setKnobOffset((trackRef.current?.getBoundingClientRect().width ?? 64) - 64);
      onComplete();
      return;
    }

    setProgress(0);
    setKnobOffset(0);
  }

  return (
    <div
      aria-label="Потянуть для оформления заказа"
      className="relative h-16 touch-pan-y overflow-hidden rounded-full bg-white text-black"
      onPointerDown={(event) => {
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        updateProgress(event.clientX);
      }}
      onPointerMove={(event) => {
        if (isDragging) {
          updateProgress(event.clientX);
        }
      }}
      onPointerUp={() => {
        setIsDragging(false);
        completeIfReady();
      }}
      ref={trackRef}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setProgress(100);
          setKnobOffset((trackRef.current?.getBoundingClientRect().width ?? 64) - 64);
          onComplete();
        }
      }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-white/0"
        style={{ width: `${progress}%` }}
      />
      <span className="pointer-events-none absolute inset-0 grid place-items-center text-base font-semibold">
        Потянуть для заказа
      </span>
      <span
        className="absolute left-1 top-1 grid h-14 w-14 place-items-center rounded-full bg-black text-2xl text-white shadow-[0_10px_26px_rgba(0,0,0,0.28)] transition-transform"
        style={{
          transform: `translateX(${knobOffset}px)`,
        }}
      >
        ›
      </span>
    </div>
  );
}
