"use client";

import Image from "next/image";

import { mediaUrl, type Drink } from "../../../drinks";

export type CartItem = {
  drink: Drink;
  qty: number;
};

export function CartItemList({
  items,
  onQuantityChange,
}: {
  items: CartItem[];
  onQuantityChange: (id: string, nextQty: number) => void;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-190px)] flex-col px-4 pb-5 sm:px-6">
      <div className="space-y-3 pb-5">
        {items.map(({ drink, qty }) => (
          <article
            className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/10 pb-3"
            key={drink.id}
          >
            <div className="grid min-w-0 grid-cols-[82px_1fr] gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/8">
                <Image
                  src={mediaUrl(drink.imagePath)}
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
                onClick={() => onQuantityChange(drink.id, 0)}
                type="button"
                aria-label={`Удалить ${drink.name}`}
              >
                ×
              </button>

              <div className="grid h-9 w-28 grid-cols-3 overflow-hidden rounded-full bg-white text-black">
                <button
                  className="text-xl text-black/62 transition active:bg-black/10"
                  onClick={() => onQuantityChange(drink.id, qty - 1)}
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
                  onClick={() => onQuantityChange(drink.id, qty + 1)}
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
  );
}
