"use client";

// 運動記録ページの本体。期間サマリーと記録一覧を 1 つの期間 state で連動させる。
// 期間タブ / 前後ナビを切り替えると、サマリーの集計値と下の一覧の両方が同じ期間で絞り込まれる。

import { deleteWorkout } from "@/app/workout/actions";
import { RangePeriodControl } from "@/components/dashboard/range-period-control";
import { Stat } from "@/components/dashboard/stat";
import { useRangeState } from "@/components/dashboard/use-range-state";
import { EmptyState, RecordCard, Row } from "@/components/record-card";
import {
  formatDateTime,
  formatDuration,
  formatPace,
} from "@/lib/format";
import { getMetrics } from "@/lib/summary";

// 一覧表示に必要な全項目を含む serializable な運動記録 (Date は ISO 文字列で運ぶ)
export type WorkoutListItem = {
  id: string;
  date: string;
  distanceKm: number;
  paceSecPerKm: number;
  durationSec: number;
  calories: number;
  avgHeartRate: number;
};

type Props = {
  workouts: WorkoutListItem[];
  todayIso: string;
  oldestIso: string | null;
};

export function WorkoutSection({ workouts, todayIso, oldestIso }: Props) {
  const today = new Date(todayIso);
  const oldestDate = oldestIso ? new Date(oldestIso) : null;
  const workoutsWithDate = workouts.map((w) => ({ ...w, date: new Date(w.date) }));

  const { type, range, canPrev, canNext, setType, prev, next } = useRangeState({
    today,
    oldestDate,
  });

  const metrics = getMetrics(workoutsWithDate, range);
  const inRange = workoutsWithDate.filter(
    (w) => w.date >= range.from && w.date < range.to,
  );

  return (
    <>
      <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
        <h2 className="text-std-18B-160">期間サマリー</h2>
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

      {workouts.length === 0 ? (
        <EmptyState message="運動記録がまだありません" />
      ) : inRange.length === 0 ? (
        <p className="flex min-h-11 items-center justify-center rounded-12 border border-solid-gray-200 bg-white p-8 text-std-16N-170 text-solid-gray-700">
          この期間の運動記録はありません
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {inRange.map((w) => {
            const dateLabel = formatDateTime(w.date);
            return (
              <li key={w.id}>
                <RecordCard
                  title={dateLabel}
                  deleteLabel={`${dateLabel} の運動記録`}
                  deleteAction={deleteWorkout.bind(null, w.id)}
                >
                  <Row label="距離" value={`${w.distanceKm.toFixed(2)} km`} />
                  <Row label="ペース" value={`${formatPace(w.paceSecPerKm)} /km`} />
                  <Row label="時間" value={formatDuration(w.durationSec)} />
                  <Row label="カロリー" value={`${w.calories} kcal`} />
                  <Row label="心拍数" value={`${w.avgHeartRate} bpm`} />
                </RecordCard>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
