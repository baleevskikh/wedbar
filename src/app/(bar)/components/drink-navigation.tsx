"use client";

import type { Drink } from "../../drinks";

export function DrinkNavigation({
  activeDrinkIndex,
  drinks,
  onDrinkSelect,
}: {
  activeDrinkIndex: number;
  drinks: Drink[];
  onDrinkSelect: (index: number) => void;
}) {
  return (
    <div
      aria-label="Навигация по напиткам"
      className="pointer-events-none fixed left-1/2 top-1/2 z-20 flex w-full max-w-[var(--content-max-width)] -translate-x-1/2 -translate-y-1/2 flex-col items-end gap-2.5 px-4 sm:px-6"
    >
      {drinks.map((drink, index) => {
        const isActive = index === activeDrinkIndex;

        return (
          <button
            aria-current={isActive ? "true" : undefined}
            aria-label={`Перейти к ${drink.name}`}
            className={[
              "h-2.5 w-2.5 rounded-full border border-white/55 transition",
              "pointer-events-auto",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
              isActive ? "scale-125 bg-white" : "bg-white/25 hover:bg-white/60",
            ].join(" ")}
            key={drink.id}
            onClick={() => onDrinkSelect(index)}
            type="button"
          />
        );
      })}
    </div>
  );
}
