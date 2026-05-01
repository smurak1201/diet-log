"use client";

// ホームの運動カード。期間切替 + メトリック + 棒グラフ

import { formatDuration, formatPace } from "@/lib/format";
import { bucketWorkouts, getMetrics } from "@/lib/summary";
import { WorkoutChart } from "./charts";
import { RangePeriodControl } from "./range-period-control";
import { Stat } from "./stat";
import type { WorkoutPayload } from "./types";
import { useRangeState } from "./use-range-state";

type Props = {
  workouts: WorkoutPayload[];
  todayIso: string;
  oldestIso: string | null;
};

export function ActivityCard({ workouts, todayIso, oldestIso }: Props) {
  const today = new Date(todayIso);
  const oldestDate = oldestIso ? new Date(oldestIso) : null;
  const workoutsWithDate = workouts.map((w) => ({ ...w, date: new Date(w.date) }));

  const { type, range, canPrev, canNext, setType, prev, next } = useRangeState({
    today,
    oldestDate,
  });
  const metrics = getMetrics(workoutsWithDate, range);
  const buckets = bucketWorkouts(workoutsWithDate, range);

  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">運動</h2>
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
        <Stat
          label="平均ペース"
          value={
            metrics.avgPaceSecPerKm !== null
              ? `${formatPace(metrics.avgPaceSecPerKm)} /km`
              : "-"
          }
        />
      </dl>
      <div className="mt-4">
        {metrics.count > 0 ? (
          <WorkoutChart data={buckets} />
        ) : (
          <p className="py-12 text-center text-std-16N-170 text-solid-gray-700">
            この期間の運動記録はありません
          </p>
        )}
      </div>
    </article>
  );
}
