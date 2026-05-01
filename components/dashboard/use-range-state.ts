"use client";

// 期間切替カードの共通 state フック。
// initialBaseDate は SSR/CSR で同じ値にするため Server からの ISO 経由で渡す前提。

import { useState } from "react";
import type { RangeType } from "@/lib/summary";

export type RangeState = {
  type: RangeType;
  baseDate: Date;
};

export function useRangeState(initialBaseDate: Date) {
  return useState<RangeState>({ type: "month", baseDate: initialBaseDate });
}
