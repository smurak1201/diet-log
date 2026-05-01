"use client";

// ダッシュボードの期間切替カード共通フック。
// state (type / baseDate) と派生値 (range / canPrev / canNext) と操作 (setType / prev / next) を一括で返す。
// today は呼び出し側で毎レンダ new Date(...) されてもよい:
// 内部 useState の初期値は初回のみ評価され、getRange / canShift は値ベース比較なので影響しない。

import { useState } from "react";
import {
  canShift,
  getRange,
  type RangeContext,
  type RangeType,
  shiftBaseDate,
} from "@/lib/summary";

type Args = {
  today: Date;
  oldestDate: Date | null;
};

type Result = {
  type: RangeType;
  range: RangeContext;
  canPrev: boolean;
  canNext: boolean;
  setType: (next: RangeType) => void;
  prev: () => void;
  next: () => void;
};

export function useRangeState({ today, oldestDate }: Args): Result {
  const [state, setState] = useState<{ type: RangeType; baseDate: Date }>({
    type: "month",
    baseDate: today,
  });

  return {
    type: state.type,
    range: getRange(state.type, state.baseDate, oldestDate),
    canPrev: canShift(state.type, state.baseDate, -1, oldestDate, today),
    canNext: canShift(state.type, state.baseDate, 1, oldestDate, today),
    setType: (next) => setState({ type: next, baseDate: today }),
    prev: () =>
      setState((s) => ({
        ...s,
        baseDate: shiftBaseDate(s.type, s.baseDate, -1),
      })),
    next: () =>
      setState((s) => ({
        ...s,
        baseDate: shiftBaseDate(s.type, s.baseDate, 1),
      })),
  };
}
