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
  const totalDrinks = selectedItems.reduce((total, item) => total + item.qty, 0);

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

  return (
    <main className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black text-white">
      <div className="sticky top-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.92),rgba(0,0,0,0.72)_72%,rgba(0,0,0,0))] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+18px)] backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <Link
            className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/8 text-2xl leading-none text-white/90 backdrop-blur-md transition active:scale-[0.98]"
            href="/"
            aria-label="Вернуться к меню"
          >
            ‹
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/56">WedBar</p>
            <h1 className="text-3xl font-semibold leading-none tracking-[-0.04em]">
              Корзина
            </h1>
          </div>
          <div className="grid h-11 min-w-11 place-items-center rounded-full bg-white px-3 text-base font-semibold text-black">
            {totalDrinks}
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-112px)] max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] sm:px-6">
        {selectedItems.length > 0 ? (
          <>
            <div className="space-y-3 pb-5">
              {selectedItems.map(({ drink, qty }) => (
                <article
                  className="grid grid-cols-[72px_1fr] gap-3 rounded-[28px] border border-white/10 bg-white/[0.07] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md"
                  key={drink.id}
                >
                  <div className="relative h-[72px] overflow-hidden rounded-2xl bg-white/8">
                    <Image
                      src={drink.image}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold leading-6">
                          {drink.name}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/58">
                          {drink.ingredients}
                        </p>
                      </div>
                      <button
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xl leading-none text-white/72 transition active:scale-[0.96] active:bg-white/18"
                        onClick={() => updateQuantity(drink.id, 0)}
                        type="button"
                        aria-label={`Удалить ${drink.name}`}
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-4 grid h-11 grid-cols-3 overflow-hidden rounded-full bg-white text-black">
                      <button
                        className="text-2xl text-black/62 transition active:bg-black/10"
                        onClick={() => updateQuantity(drink.id, qty - 1)}
                        type="button"
                        aria-label={`Уменьшить количество ${drink.name}`}
                      >
                        −
                      </button>
                      <span className="grid place-items-center text-base font-semibold">
                        {qty}
                      </span>
                      <button
                        className="text-2xl transition active:bg-black/10"
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

            <div className="mt-auto rounded-[30px] border border-white/10 bg-white/[0.08] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between px-2 text-sm text-white/62">
                <span>Итого</span>
                <span>
                  {totalDrinks} {getDrinkWord(totalDrinks)}
                </span>
              </div>
              <SlideToOrder onComplete={submitOrderPreview} />
              <button
                className="mt-3 h-12 w-full rounded-full bg-white px-5 text-sm font-medium text-black transition active:scale-[0.99] active:bg-white/86"
                onClick={submitOrderPreview}
                type="button"
              >
                Оформить обычной кнопкой
              </button>
              {isSubmitted ? (
                <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-5 text-black">
                  Заказ собран. Подключение отправки в API будет следующим
                  шагом.
                </p>
              ) : null}
            </div>
          </>
        ) : (
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
        )}
      </div>
    </main>
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

function getDrinkWord(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return "напиток";
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return "напитка";
  }

  return "напитков";
}
