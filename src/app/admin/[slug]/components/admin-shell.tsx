"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Дашборд", icon: "grid", href: "" },
  { label: "Напитки", icon: "list", href: "/drinks" },
  { label: "Добавить", icon: "plus", href: "/drinks/new" },
] as const;

export function AdminShell({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const pathname = usePathname();
  const basePath = `/admin/${slug}`;

  return (
    <main className="fixed inset-0 z-50 overflow-auto bg-black text-white">
      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-black/96 px-3 py-2 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-[76px] md:border-r md:border-t-0 md:px-3 md:py-5">
        <nav className="mx-auto flex max-w-[420px] justify-around gap-2 md:h-full md:flex-col md:justify-start">
          {navItems.map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive = pathname === href;

            return (
              <Link
                aria-label={item.label}
                className={[
                  "grid min-w-[64px] place-items-center gap-1 rounded-[12px] px-3 py-2 text-[11px] font-semibold transition md:min-w-0 md:px-0 md:py-3",
                  isActive
                    ? "bg-[#242424] text-white"
                    : "text-white/55 hover:bg-white/8 hover:text-white",
                ].join(" ")}
                href={href}
                key={item.href}
              >
                <AdminIcon name={item.icon} />
                <span className="md:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-h-dvh pb-[76px] md:pb-0 md:pl-[76px]">{children}</div>
    </main>
  );
}

function AdminIcon({ name }: { name: "grid" | "list" | "plus" }) {
  if (name === "plus") {
    return (
      <span className="relative block size-6 rounded-[7px] bg-white/10 before:absolute before:left-1/2 before:top-1/2 before:h-[14px] before:w-[2px] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-current after:absolute after:left-1/2 after:top-1/2 after:h-[2px] after:w-[14px] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-current" />
    );
  }

  if (name === "list") {
    return (
      <span className="grid size-6 gap-[3px] rounded-[7px] bg-white/10 p-[5px]">
        <span className="rounded-full bg-current" />
        <span className="rounded-full bg-current" />
        <span className="rounded-full bg-current" />
      </span>
    );
  }

  return (
    <span className="grid size-6 grid-cols-2 gap-[4px] rounded-[7px] bg-white/10 p-[5px]">
      <span className="rounded-[2px] bg-current" />
      <span className="rounded-[2px] bg-current" />
      <span className="rounded-[2px] bg-current" />
      <span className="rounded-[2px] bg-current" />
    </span>
  );
}
