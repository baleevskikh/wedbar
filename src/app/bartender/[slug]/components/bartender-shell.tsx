"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NOTIFICATION_SOUND_SRC = "/sounds/order-notification.mp3";
const NOTIFICATION_SOUND_DISABLED_KEY = "wedbar.bartender.notificationSoundDisabled";

type NotificationSoundState = "pending" | "enabled" | "blocked" | "disabled";
type WebAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function BartenderShell({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const pathname = usePathname();
  const ordersPath = `/bartender/${slug}`;
  const settingsPath = `/bartender/${slug}/settings`;
  const isSettings = pathname === settingsPath;
  const [notificationSoundState, setNotificationSoundState] =
    useState<NotificationSoundState>("pending");
  const [notificationSoundMessage, setNotificationSoundMessage] = useState(
    "Звуковые уведомления о новых заказах включатся после взаимодействия со страницей",
  );
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notificationBufferRef = useRef<AudioBuffer | null>(null);
  const notificationBufferPromiseRef = useRef<Promise<AudioBuffer> | null>(null);
  const notificationSoundStateRef =
    useRef<NotificationSoundState>(notificationSoundState);

  useEffect(() => {
    notificationSoundStateRef.current = notificationSoundState;
  }, [notificationSoundState]);

  const getNotificationAudio = useCallback(() => {
    notificationAudioRef.current ??= new Audio(NOTIFICATION_SOUND_SRC);
    notificationAudioRef.current.preload = "auto";
    return notificationAudioRef.current;
  }, []);

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextConstructor =
      window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) {
      return null;
    }

    audioContextRef.current = new AudioContextConstructor();
    return audioContextRef.current;
  }, []);

  const loadNotificationBuffer = useCallback(async (audioContext: AudioContext) => {
    if (notificationBufferRef.current) {
      return notificationBufferRef.current;
    }

    notificationBufferPromiseRef.current ??= fetch(NOTIFICATION_SOUND_SRC, {
      cache: "force-cache",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Notification sound request failed");
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));

    notificationBufferRef.current = await notificationBufferPromiseRef.current;
    return notificationBufferRef.current;
  }, []);

  const playSilentUnlockSound = useCallback((audioContext: AudioContext) => {
    const source = audioContext.createBufferSource();
    source.buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
    source.connect(audioContext.destination);
    source.start(0);
  }, []);

  const unlockNotificationSound = useCallback(async () => {
    if (window.localStorage.getItem(NOTIFICATION_SOUND_DISABLED_KEY) === "1") {
      notificationSoundStateRef.current = "disabled";
      setNotificationSoundState("disabled");
      setNotificationSoundMessage("Звуковые уведомления о новых заказах выключены");
      return;
    }

    if (
      notificationSoundStateRef.current === "enabled" ||
      notificationSoundStateRef.current === "disabled"
    ) {
      return;
    }

    try {
      const audioContext = getAudioContext();
      if (!audioContext) {
        const audio = getNotificationAudio();
        audio.load();
      } else {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
        playSilentUnlockSound(audioContext);
        await loadNotificationBuffer(audioContext);
      }

      notificationSoundStateRef.current = "enabled";
      setNotificationSoundState("enabled");
      setNotificationSoundMessage("Звуковые уведомления о новых заказах включены");
    } catch {
      notificationSoundStateRef.current = "blocked";
      setNotificationSoundState("blocked");
      setNotificationSoundMessage(
        "Браузер пока не разрешил звук. Нажмите кнопку звука ещё раз",
      );
    }
  }, [getAudioContext, getNotificationAudio, loadNotificationBuffer, playSilentUnlockSound]);

  const playNotificationSound = useCallback(async () => {
    if (notificationSoundStateRef.current !== "enabled") {
      return;
    }

    try {
      const audioContext = getAudioContext();

      if (audioContext) {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const source = audioContext.createBufferSource();
        source.buffer = await loadNotificationBuffer(audioContext);
        source.connect(audioContext.destination);
        source.start(0);
        return;
      }

      const fallbackAudio = getNotificationAudio();
      fallbackAudio.currentTime = 0;
      await fallbackAudio.play();
    } catch {
      notificationSoundStateRef.current = "blocked";
      setNotificationSoundState("blocked");
      setNotificationSoundMessage(
        "Браузер заблокировал звук уведомлений. Нажмите кнопку звука ещё раз",
      );
    }
  }, [getAudioContext, getNotificationAudio, loadNotificationBuffer]);

  function enableNotificationSound() {
    window.localStorage.removeItem(NOTIFICATION_SOUND_DISABLED_KEY);
    notificationSoundStateRef.current = "pending";
    setNotificationSoundState("pending");
    setNotificationSoundMessage(
      "Звуковые уведомления о новых заказах включатся после нажатия кнопки",
    );
    void unlockNotificationSound();
  }

  function disableNotificationSound() {
    notificationAudioRef.current?.pause();
    void audioContextRef.current?.suspend();
    window.localStorage.setItem(NOTIFICATION_SOUND_DISABLED_KEY, "1");
    notificationSoundStateRef.current = "disabled";
    setNotificationSoundState("disabled");
    setNotificationSoundMessage("Звуковые уведомления о новых заказах выключены");
  }

  useEffect(() => {
    if (window.localStorage.getItem(NOTIFICATION_SOUND_DISABLED_KEY) === "1") {
      queueMicrotask(() => {
        notificationSoundStateRef.current = "disabled";
        setNotificationSoundState("disabled");
        setNotificationSoundMessage("Звуковые уведомления о новых заказах выключены");
      });
    }
  }, []);

  useEffect(() => {
    const handleUserGesture = () => {
      void unlockNotificationSound();
    };

    window.addEventListener("pointerdown", handleUserGesture);
    window.addEventListener("keydown", handleUserGesture);
    window.addEventListener("touchstart", handleUserGesture);

    return () => {
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
    };
  }, [unlockNotificationSound]);

  useEffect(() => {
    const events = new EventSource("/api/events");
    events.addEventListener("order.created", () => {
      void playNotificationSound();
    });

    return () => {
      events.close();
    };
  }, [playNotificationSound]);

  return (
    <main className="fixed inset-0 z-50 overflow-hidden bg-black text-black">
      <aside className="absolute left-0 top-0 z-20 flex h-full w-[58px] flex-col items-center gap-2 border-r border-white/5 bg-black px-2 py-4">
        <Link
          aria-label="Панель заказов"
          className={[
            "grid size-10 place-items-center rounded-[9px] text-white",
            isSettings
              ? "border border-white/12 bg-black"
              : "bg-[#242424] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
          ].join(" ")}
          href={ordersPath}
        >
          <span className="grid grid-cols-2 gap-[3px]">
            <span className="size-[5px] rounded-[1px] bg-white" />
            <span className="size-[5px] rounded-[1px] bg-white" />
            <span className="size-[5px] rounded-[1px] bg-white" />
            <span className="size-[5px] rounded-[1px] bg-white" />
          </span>
        </Link>
        <Link
          aria-label="Настройки"
          className={[
            "grid size-10 place-items-center rounded-[9px] text-white",
            isSettings
              ? "bg-[#242424] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
              : "border border-white/12 bg-black",
          ].join(" ")}
          href={settingsPath}
        >
          <span className="flex flex-col gap-[4px]">
            <span className="h-[2px] w-5 rounded-full bg-white before:block before:size-[5px] before:-translate-y-[1.5px] before:translate-x-[3px] before:rounded-full before:bg-white" />
            <span className="h-[2px] w-5 rounded-full bg-white before:block before:size-[5px] before:-translate-y-[1.5px] before:translate-x-[12px] before:rounded-full before:bg-white" />
            <span className="h-[2px] w-5 rounded-full bg-white before:block before:size-[5px] before:-translate-y-[1.5px] before:translate-x-[7px] before:rounded-full before:bg-white" />
          </span>
        </Link>
        <NotificationSoundButton
          message={notificationSoundMessage}
          onDisable={disableNotificationSound}
          onEnable={enableNotificationSound}
          state={notificationSoundState}
        />
      </aside>

      <div className="ml-[58px] h-dvh">{children}</div>
    </main>
  );
}

function NotificationSoundButton({
  message,
  onDisable,
  onEnable,
  state,
}: {
  message: string;
  onDisable: () => void;
  onEnable: () => void;
  state: NotificationSoundState;
}) {
  const isBlocked = state === "blocked";
  const isEnabled = state === "enabled";
  const label = isEnabled
    ? "Выключить звуковые уведомления о новых заказах"
    : "Включить звуковые уведомления о новых заказах";

  return (
    <>
      <button
        aria-label={label}
        aria-pressed={isEnabled}
        className={[
          "mt-auto grid size-10 place-items-center rounded-[9px] border text-[18px] font-black transition",
          isEnabled
            ? "bg-white text-black"
            : "border bg-black text-white",
          isBlocked ? "border-[#ffc4c4]" : "border-white/12",
        ].join(" ")}
        onClick={isEnabled ? onDisable : onEnable}
        title={label}
        type="button"
      >
        <SpeakerIcon muted={!isEnabled} />
      </button>
      <span className="sr-only" role="status">
        {message}
      </span>
    </>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 9.5v5h3.8l4.7 4.1V5.4L7.8 9.5H4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      {muted ? (
        <>
          <path
            d="m17 9 4 4m0-4-4 4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path
            d="M16 9.2a4 4 0 0 1 0 5.6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d="M18.8 6.5a8 8 0 0 1 0 11"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}
