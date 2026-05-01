"use client";

// 運動記録の期間サマリー。
// /workout ページのトップに置き、週/月/年/すべての期間切替で 4 メトリック (回数/距離/時間/カロリー) を表示する

import { formatDuration } from "@/lib/format";
import { getMetrics } from "@/lib/summary";
import { RangePeriodControl } from "./range-period-control";
import { Stat } from "./stat";
import type { WorkoutPayload } from "./types";
import { useRangeState } from "./use-range-state";

type Props = {
  title: string;
  workouts: WorkoutPayload[];
  todayIso: string;
  oldestIso: string | null;
};

export function SummaryCard({ title, workouts, todayIso, oldestIso }: Props) {
  const today = new Date(todayIso);
  const oldestDate = oldestIso ? new Date(oldestIso) : null;
  const workoutsWithDate = workouts.map((w) => ({ ...w, date: new Date(w.date) }));

  const { type, range, canPrev, canNext, setType, prev, next } = useRangeState({
    today,
    oldestDate,
  });
  const metrics = getMetrics(workoutsWithDate, range);

  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">{title}</h2>
      <RangePeriodControl
        type={type}
        range={range}
        canPrev={canPrev}
        canNext={canNext}
        onChangeType={setType}
        onPrev={prev}
        onNext={next}
      />
      <hr className="my-3 border-solid-gray-200" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat label="運動回数" value={`${metrics.count} 回`} />
        <Stat label="合計距離" value={`${metrics.distanceKm.toFixed(2)} km`} />
        <Stat label="合計時間" value={formatDuration(metrics.durationSec)} />
        <Stat label="消費カロリー" value={`${metrics.calories} kcal`} />
      </dl>
    </article>
  );
}
