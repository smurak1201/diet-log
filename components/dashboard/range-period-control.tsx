"use client";

// 期間切替タブ + 前後ナビ (or "すべて" のラベル) のセット。
// 3 カードで同じ並びを描画していたので分離。

import type { RangeContext, RangeType } from "@/lib/summary";
import { RangeNav } from "./range-nav";
import { RangeTabs } from "./range-tabs";

type Props = {
  type: RangeType;
  range: RangeContext;
  canPrev: boolean;
  canNext: boolean;
  onChangeType: (next: RangeType) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function RangePeriodControl({
  type,
  range,
  canPrev,
  canNext,
  onChangeType,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="mt-3 flex flex-col gap-3">
      <RangeTabs value={type} onChange={onChangeType} />
      {type !== "all" ? (
        <RangeNav
          label={range.label}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={onPrev}
          onNext={onNext}
        />
      ) : (
        <p className="flex min-h-11 items-center justify-center text-std-16B-170 text-solid-gray-700">
          {range.label}
        </p>
      )}
    </div>
  );
}
