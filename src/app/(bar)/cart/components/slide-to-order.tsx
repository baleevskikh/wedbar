"use client";

import type { CSSProperties } from "react";
import { useRef, useState } from "react";

import styles from "./slide-to-order.module.css";

const TRACK_INSET = 4;
const HANDLE_WIDTH = 104;

export function SlideToOrder({
  disabled,
  onComplete,
}: {
  disabled: boolean;
  onComplete: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [fillWidth, setFillWidth] = useState(HANDLE_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const shouldHint = !disabled && !isDragging && progress === 0;

  function updateProgress(clientX: number) {
    if (disabled) {
      return;
    }

    const track = trackRef.current;

    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const maxFillWidth = rect.width - TRACK_INSET * 2;
    const fillDistance = Math.max(maxFillWidth - HANDLE_WIDTH, 1);
    const nextFillWidth = Math.min(
      Math.max(clientX - rect.left - TRACK_INSET, HANDLE_WIDTH),
      maxFillWidth,
    );
    const nextProgress = ((nextFillWidth - HANDLE_WIDTH) / fillDistance) * 100;

    setProgress(nextProgress);
    setFillWidth(nextFillWidth);
  }

  function completeIfReady() {
    if (disabled) {
      return;
    }

    if (progress >= 84) {
      const rect = trackRef.current?.getBoundingClientRect();

      setProgress(100);
      setFillWidth(rect ? rect.width - TRACK_INSET * 2 : HANDLE_WIDTH);
      onComplete();
      return;
    }

    setProgress(0);
    setFillWidth(HANDLE_WIDTH);
  }

  return (
    <div
      aria-label="Тяните для заказа"
      aria-disabled={disabled}
      className={styles.slider}
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
          if (disabled) {
            return;
          }
          const rect = trackRef.current?.getBoundingClientRect();

          setProgress(100);
          setFillWidth(rect ? rect.width - TRACK_INSET * 2 : HANDLE_WIDTH);
          onComplete();
        }
      }}
    >
      <span className={styles.label}>
        <span className={styles.text}>Тяните для заказа</span>
      </span>
      <div
        className={[styles.fill, shouldHint ? styles.hint : ""].join(" ")}
        style={{
          "--fill-width": `${fillWidth}px`,
        } as CSSProperties}
      >
        <svg
          aria-hidden="true"
          className={styles.icon}
          fill="none"
          viewBox="0 0 32 24"
        >
          <path
            d="m6 5 7 7-7 7M16 5l7 7-7 7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
        </svg>
      </div>
    </div>
  );
}
