"use client";

import { cn } from "@/lib/cn";
import type { RangeType } from "@/lib/summary";

const TABS: ReadonlyArray<{ type: RangeType; label: string }> = [
  { type: "week", label: "週" },
  { type: "month", label: "月" },
  { type: "year", label: "年" },
  { type: "all", label: "すべて" },
];

type Props = {
  value: RangeType;
  onChange: (next: RangeType) => void;
};

export function RangeTabs({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="期間切替"
      className="grid grid-cols-4 gap-1 rounded-8 bg-solid-gray-50 p-1"
    >
      {TABS.map((t) => {
        const active = t.type === value;
        return (
          <button
            key={t.type}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.type)}
            className={cn(
              "min-h-11 cursor-pointer rounded-6 text-std-14N-130 transition-all",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
              active
                ? "bg-white text-blue-800 shadow-1"
                : "text-solid-gray-700 hover:bg-white/50",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
