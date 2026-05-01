"use client";

// 運動記録の期間サマリー。
// /workout ページのトップに置き、週/月/年/すべての期間切替で 4 メトリック (回数/距離/時間/カロリー) を表示する。

import { useMemo } from "react";
import { formatDuration } from "@/lib/format";
import {
  canShift,
  getMetrics,
  getRange,
  shiftBaseDate,
  type RangeType,
} from "@/lib/summary";
import { RangeNav } from "./range-nav";
import { RangeTabs } from "./range-tabs";
import type { WorkoutPayload } from "./types";
import { useRangeState } from "./use-range-state";

type Props = {
  title: string;
  workouts: WorkoutPayload[];
  todayIso: string;
  oldestIso: string | null;
};

export function SummaryCard({ title, workouts, todayIso, oldestIso }: Props) {
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const oldestDate = useMemo(
    () => (oldestIso ? new Date(oldestIso) : null),
    [oldestIso],
  );
  const workoutsWithDate = useMemo(
    () => workouts.map((w) => ({ ...w, date: new Date(w.date) })),
    [workouts],
  );

  const [state, setState] = useRangeState(today);
  const range = getRange(state.type, state.baseDate, oldestDate);
  const metrics = getMetrics(workoutsWithDate, range);

  const handleType = (next: RangeType) => setState({ type: next, baseDate: today });
  const handlePrev = () =>
    setState((s) => ({ ...s, baseDate: shiftBaseDate(s.type, s.baseDate, -1) }));
  const handleNext = () =>
    setState((s) => ({ ...s, baseDate: shiftBaseDate(s.type, s.baseDate, 1) }));

  const canPrev = canShift(state.type, state.baseDate, -1, oldestDate, today);
  const canNext = canShift(state.type, state.baseDate, 1, oldestDate, today);

  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">
        <RangeTabs value={state.type} onChange={handleType} />
        {state.type !== "all" && (
          <RangeNav
            label={range.label}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
        {state.type === "all" && (
          <p className="text-std-14N-130 text-solid-gray-700">{range.label}</p>
        )}
      </div>
      <hr className="my-3 border-solid-gray-200" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat label="運動回数" value={`${metrics.count} 回`} />
        <Stat
          label="合計距離"
          value={`${metrics.distanceKm.toFixed(2)} km`}
        />
        <Stat label="合計時間" value={formatDuration(metrics.durationSec)} />
        <Stat label="消費カロリー" value={`${metrics.calories} kcal`} />
      </dl>
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
