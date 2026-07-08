"use client";

import { useRef, useState } from "react";

export function SlideToOrder({ onComplete }: { onComplete: () => void }) {
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
