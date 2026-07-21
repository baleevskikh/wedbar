"use client";

import Image from "next/image";
import Link from "next/link";

import type { OrderHistoryEntry } from "../../cart-storage";
import { LogoMark } from "../../components/logo-mark";
import { mediaUrl, type Drink } from "../../drinks";

export function HomeHeader({
  history,
  selectedDrinks,
  table,
  totalDrinks,
}: {
  history: OrderHistoryEntry[];
  selectedDrinks: Drink[];
  table: number;
  totalDrinks: number;
}) {
  return (
    <header className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+14px)] z-30 flex h-11 w-full max-w-[var(--content-max-width)] -translate-x-1/2 items-center gap-4 px-4 sm:px-6">
      <div className="shrink-0 text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]">
        <LogoMark className="h-11 w-12" />
      </div>

      {totalDrinks > 0 ? (
        <Link
          aria-label={`Перейти в корзину, ${totalDrinks} напитков`}
          className="pointer-events-auto ml-auto flex h-11 max-w-full items-center gap-2 rounded-full border border-white/70 bg-white pl-3.5 pr-2 text-black shadow-[0_12px_32px_rgba(0,0,0,0.24)] backdrop-blur-md transition active:scale-[0.98]"
          href={`/cart?table=${table}`}
        >
          <CartIcon className="h-5 w-5 shrink-0" />
          <span className="ml-0.5 flex -space-x-2">
            {selectedDrinks.map((drink) => (
              <span
                className="relative h-7 w-7 overflow-hidden rounded-full border border-black/10 bg-white"
                key={drink.id}
              >
                <Image
                  src={mediaUrl(drink.imagePath)}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </span>
            ))}
          </span>
        </Link>
      ) : history.length > 0 ? (
        <div className="pointer-events-auto relative min-w-0 flex-1">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pl-7 [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_22px,black_100%)] [mask-image:linear-gradient(to_right,transparent_0,black_22px,black_100%)] [&>:first-child]:ml-auto">
            {history.map((order) => {
              const previewItems = order.items.slice(0, 3);

              return (
                <Link
                  aria-label={`Открыть заказ №${order.id}`}
                  className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/70 bg-white py-1.5 pl-2 pr-3.5 text-black transition active:scale-[0.98]"
                  href={`/order/${order.id}?table=${table}`}
                  key={order.id}
                >
                  {previewItems.length > 0 ? (
                    <span className="flex -space-x-2">
                      {previewItems.map((item) => (
                        <span
                          className="relative h-7 w-7 overflow-hidden rounded-full border border-black/10 bg-white"
                          key={item.drinkId}
                        >
                          {item.imagePath ? (
                            <Image
                              src={mediaUrl(item.imagePath)}
                              alt=""
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : null}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  <span className="whitespace-nowrap text-sm font-bold leading-none">
                    Заказ №{order.id}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
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
