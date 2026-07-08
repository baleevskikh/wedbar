"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      </aside>

      <div className="ml-[58px] h-dvh">{children}</div>
    </main>
  );
}
