"use client";

import Image from "next/image";
import { useState } from "react";

import { mediaUrl, type Drink } from "../../drinks";

export function DrinkSection({
  addDrink,
  drink,
  index,
  isOrderingBlocked,
  qty,
  removeDrink,
}: {
  addDrink: (id: string) => void;
  drink: Drink;
  index: number;
  isOrderingBlocked: boolean;
  qty: number;
  removeDrink: (id: string) => void;
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const posterUrl = mediaUrl(drink.imagePath);
  const videoUrl = mediaUrl(drink.videoPath);

  return (
    <section className="relative h-dvh overflow-hidden [scroll-snap-align:start] [scroll-snap-stop:always]">
      <Image
        src={posterUrl}
        alt={drink.name}
        fill
        priority={index === 0}
        sizes="100vw"
        className="object-cover"
        onLoad={() => setIsImageLoaded(true)}
      />
      {videoUrl && isImageLoaded ? (
        <video
          aria-hidden="true"
          autoPlay
          className={[
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            isVideoReady ? "opacity-100" : "opacity-0",
          ].join(" ")}
          loop
          muted
          onCanPlay={() => setIsVideoReady(true)}
          playsInline
          poster={posterUrl}
          preload="auto"
          src={videoUrl}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0)_34%,rgba(0,0,0,0.86)_100%)]" />

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:px-6 sm:pb-6">
        <div>
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
                className="h-14 w-full rounded-2xl bg-white px-5 text-lg font-medium text-black transition active:scale-[0.99] active:bg-white/86 disabled:opacity-55"
                disabled={isOrderingBlocked}
                onClick={() => addDrink(drink.id)}
                type="button"
              >
                {isOrderingBlocked ? "Заказ уже активен" : "Добавить"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
