"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { TABS } from "./tabs";

export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主要ナビゲーション"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40",
        "border-t border-solid-gray-200 bg-white",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-4">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname === tab.href;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-blue",
                  isActive ? "text-blue-800" : "text-solid-gray-700",
                )}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {tab.icon}
                </span>
                <span className="text-dns-14N-130">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
