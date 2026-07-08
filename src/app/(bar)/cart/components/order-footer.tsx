"use client";

import { SlideToOrder } from "./slide-to-order";

export function OrderFooter({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: () => void;
}) {
  return (
    <footer className="sticky bottom-0 z-20 w-full bg-white/[0.08] px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 backdrop-blur-md sm:px-6">
      <div>
        <SlideToOrder disabled={disabled} onComplete={onSubmit} />
      </div>
    </footer>
  );
}
