"use client";

// ホームの体組成カード。期間切替 + 簡易メトリック + 折れ線グラフ。

import { useMemo } from "react";
import {
  bucketBodies,
  canShift,
  getRange,
  shiftBaseDate,
  type RangeType,
} from "@/lib/summary";
import { BodyChart } from "./charts";
import { RangeNav } from "./range-nav";
import { RangeTabs } from "./range-tabs";
import type { BodyPayload } from "./types";
import { useRangeState } from "./use-range-state";

type Props = {
  bodies: BodyPayload[];
  todayIso: string;
  oldestIso: string | null;
};

export function BodyTrendCard({ bodies, todayIso, oldestIso }: Props) {
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const oldestDate = useMemo(
    () => (oldestIso ? new Date(oldestIso) : null),
    [oldestIso],
  );
  const bodiesWithDate = useMemo(
    () => bodies.map((b) => ({ ...b, date: new Date(b.date) })),
    [bodies],
  );

  const [state, setState] = useRangeState(today);
  const range = getRange(state.type, state.baseDate, oldestDate);
  const buckets = bucketBodies(bodiesWithDate, range);

  const handleType = (next: RangeType) =>
    setState({ type: next, baseDate: today });
  const handlePrev = () =>
    setState((s) => ({ ...s, baseDate: shiftBaseDate(s.type, s.baseDate, -1) }));
  const handleNext = () =>
    setState((s) => ({ ...s, baseDate: shiftBaseDate(s.type, s.baseDate, 1) }));

  const canPrev = canShift(state.type, state.baseDate, -1, oldestDate, today);
  const canNext = canShift(state.type, state.baseDate, 1, oldestDate, today);

  // 折れ線にプロットされた点 = 期間内に計測 (週/月) or 平均値が出た月 (年/all)
  const pointCount = buckets.length;
  const avgWeight =
    pointCount > 0
      ? buckets.reduce((s, b) => s + b.weightKg, 0) / pointCount
      : null;
  const avgBodyFat =
    pointCount > 0
      ? buckets.reduce((s, b) => s + b.bodyFatPct, 0) / pointCount
      : null;

  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">体組成</h2>
      <div className="mt-3 flex flex-col gap-3">
        <RangeTabs value={state.type} onChange={handleType} />
        {state.type !== "all" ? (
          <RangeNav
            label={range.label}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        ) : (
          <p className="text-std-14N-130 text-solid-gray-700">{range.label}</p>
        )}
      </div>
      <hr className="my-3 border-solid-gray-200" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat
          label="平均体重"
          value={avgWeight !== null ? `${avgWeight.toFixed(1)} kg` : "-"}
        />
        <Stat
          label="平均体脂肪率"
          value={avgBodyFat !== null ? `${avgBodyFat.toFixed(1)} %` : "-"}
        />
      </dl>
      <div className="mt-4">
        {pointCount > 0 ? (
          <BodyChart data={buckets} />
        ) : (
          <p className="py-12 text-center text-std-16N-170 text-solid-gray-700">
            この期間の体組成記録はありません
          </p>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-std-14N-130 text-solid-gray-700">{label}</dt>
      <dd className="text-std-18B-160">{value}</dd>
    </div>
  );
}
