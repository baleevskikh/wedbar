"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  getServerCartSnapshot,
  readCart,
  subscribeCart,
  writeCart,
} from "./cart-storage";
import { LogoMark } from "./components/logo-mark";
import { drinks, type Drink } from "./drinks";

export default function HomePage() {
  const scrollRef = useRef<HTMLElement>(null);
  const [activeDrinkIndex, setActiveDrinkIndex] = useState(0);
  const quantities = useSyncExternalStore(
    subscribeCart,
    readCart,
    getServerCartSnapshot,
  );
  const selectedDrinks = drinks.filter((drink) => (quantities[drink.id] ?? 0) > 0);
  const totalDrinks = selectedDrinks.reduce(
    (total, drink) => total + (quantities[drink.id] ?? 0),
    0,
  );

  function addDrink(id: string) {
    const current = readCart();

    writeCart({
      ...current,
      [id]: (current[id] ?? 0) + 1,
    });
  }

  function removeDrink(id: string) {
    const current = readCart();
    const nextQty = (current[id] ?? 0) - 1;
    const next = { ...current };

    if (nextQty > 0) {
      next[id] = nextQty;
    } else {
      delete next[id];
    }

    writeCart(next);
  }

  function updateActiveDrink() {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    const nextIndex = Math.round(scroller.scrollTop / scroller.clientHeight);
    setActiveDrinkIndex(Math.min(Math.max(nextIndex, 0), drinks.length - 1));
  }

  function scrollToDrink(index: number) {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollTo({
      top: index * scroller.clientHeight,
      behavior: "smooth",
    });
  }

  return (
    <main
      className="no-scrollbar h-dvh overflow-y-auto overscroll-y-contain bg-black text-white [scroll-snap-type:y_mandatory] [-webkit-overflow-scrolling:touch]"
      onScroll={updateActiveDrink}
      ref={scrollRef}
    >
      <header className="pointer-events-none fixed inset-x-4 top-[calc(env(safe-area-inset-top)+20px)] z-30 flex h-11 items-center justify-between gap-4 sm:left-5 sm:right-6">
        <div className="text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]">
          <LogoMark className="h-11 w-12" />
        </div>

        {totalDrinks > 0 ? (
          <Link
            aria-label={`Перейти в корзину, ${totalDrinks} напитков`}
            className="pointer-events-auto flex h-11 max-w-[calc(100vw-96px)] items-center gap-2 rounded-full border border-white/70 bg-white pl-3.5 pr-2 text-black shadow-[0_12px_32px_rgba(0,0,0,0.24)] backdrop-blur-md transition active:scale-[0.98]"
            href="/cart"
          >
            <CartIcon className="h-5 w-5 shrink-0" />
            <span className="ml-0.5 flex -space-x-2">
              {selectedDrinks.map((drink) => (
                <span
                  className="relative h-7 w-7 overflow-hidden rounded-full border border-black/10 bg-white"
                  key={drink.id}
                >
                  <Image
                    src={drink.image}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              ))}
            </span>
          </Link>
        ) : null}
      </header>

      <div
        aria-label="Навигация по напиткам"
        className="fixed right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2.5 sm:right-6"
      >
        {drinks.map((drink, index) => {
          const isActive = index === activeDrinkIndex;

          return (
            <button
              aria-current={isActive ? "true" : undefined}
              aria-label={`Перейти к ${drink.name}`}
              className={[
                "h-2.5 w-2.5 rounded-full border border-white/55 transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
                isActive
                  ? "scale-125 bg-white"
                  : "bg-white/25 hover:bg-white/60",
              ].join(" ")}
              key={drink.id}
              onClick={() => scrollToDrink(index)}
              type="button"
            />
          );
        })}
      </div>

      {drinks.map((drink, index) => (
        <DrinkSection
          addDrink={addDrink}
          drink={drink}
          index={index}
          key={drink.id}
          qty={quantities[drink.id] ?? 0}
          removeDrink={removeDrink}
        />
      ))}
    </main>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 6h16l-1.6 8.2a2 2 0 0 1-2 1.6H8.3a2 2 0 0 1-2-1.7L5 3H2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M9 20.5h.01M17 20.5h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function DrinkSection({
  addDrink,
  drink,
  index,
  qty,
  removeDrink,
}: {
  addDrink: (id: string) => void;
  drink: Drink;
  index: number;
  qty: number;
  removeDrink: (id: string) => void;
}) {
  return (
    <section className="relative h-dvh overflow-hidden [scroll-snap-align:start] [scroll-snap-stop:always]">
      <Image
        src={drink.image}
        alt={drink.name}
        fill
        priority={index === 0}
        sizes="100vw"
        className="object-cover"
        placeholder="blur"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0)_34%,rgba(0,0,0,0.86)_100%)]" />

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:px-6 sm:pb-6">
        <div className="mx-auto max-w-md">
          <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-white">
            {drink.name}
          </h1>
          <p className="mt-5 max-w-sm text-lg leading-7 text-white/78">
            {drink.description}
          </p>
          <p className="mt-4 max-w-sm text-base leading-7 text-white/62">
            {drink.ingredients}
          </p>

          <div className="mt-7">
            {qty > 0 ? (
              <div className="relative grid h-14 grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white text-black">
                <button
                  className="h-full text-2xl text-black/64 transition active:scale-[0.98] active:bg-[linear-gradient(90deg,rgba(0,0,0,0.13),rgba(0,0,0,0))]"
                  onClick={() => removeDrink(drink.id)}
                  type="button"
                >
                  −
                </button>
                <button
                  className="h-full text-2xl transition active:scale-[0.98] active:bg-[linear-gradient(270deg,rgba(0,0,0,0.13),rgba(0,0,0,0))]"
                  onClick={() => addDrink(drink.id)}
                  type="button"
                >
                  +
                </button>
                <span className="pointer-events-none absolute inset-0 grid place-items-center text-lg font-medium">
                  {qty}
                </span>
              </div>
            ) : (
              <button
                className="h-14 w-full rounded-2xl bg-white px-5 text-lg font-medium text-black transition active:scale-[0.99] active:bg-white/86"
                onClick={() => addDrink(drink.id)}
                type="button"
              >
                Добавить
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
