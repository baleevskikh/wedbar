"use client";

import { SlideToOrder } from "./slide-to-order";

export function OrderFooter({
  isSubmitted,
  onSubmit,
}: {
  isSubmitted: boolean;
  onSubmit: () => void;
}) {
  return (
    <footer className="sticky bottom-0 z-20 w-full bg-white/[0.08] px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 backdrop-blur-md sm:px-6">
      <div>
        <SlideToOrder onComplete={onSubmit} />
        {isSubmitted ? (
          <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-5 text-black">
            Заказ собран. Подключение отправки в API будет следующим шагом.
          </p>
        ) : null}
      </div>
    </footer>
  );
}
