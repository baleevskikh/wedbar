"use client";

import { useRef, useState, useSyncExternalStore } from "react";

import {
  getServerCartSnapshot,
  readCart,
  subscribeCart,
  writeCart,
} from "../cart-storage";
import { drinks } from "../drinks";
import { DrinkNavigation } from "./components/drink-navigation";
import { DrinkSection } from "./components/drink-section";
import { HomeHeader } from "./components/home-header";

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
      <HomeHeader selectedDrinks={selectedDrinks} totalDrinks={totalDrinks} />
      <DrinkNavigation
        activeDrinkIndex={activeDrinkIndex}
        drinks={drinks}
        onDrinkSelect={scrollToDrink}
      />

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
