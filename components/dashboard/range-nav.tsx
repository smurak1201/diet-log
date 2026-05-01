"use client";

// ◀/▶ + 期間ラベル。`canPrev` / `canNext` で disabled 制御 (記録の最古より前 / 今日より未来は不可)

import { cn } from "@/lib/cn";

type Props = {
  label: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

const NAV_BUTTON_CLASS = cn(
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-8 text-solid-gray-700",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
  "transition-all hover:bg-solid-gray-50 active:scale-[0.96]",
  "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
);

export function RangeNav({ label, canPrev, canNext, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="前の期間"
        className={NAV_BUTTON_CLASS}
      >
        <span className="material-symbols-outlined" aria-hidden>
          chevron_left
        </span>
      </button>
      <span aria-live="polite" className="text-std-16B-170">
        {label}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="次の期間"
        className={NAV_BUTTON_CLASS}
      >
        <span className="material-symbols-outlined" aria-hidden>
          chevron_right
        </span>
      </button>
    </div>
  );
}
