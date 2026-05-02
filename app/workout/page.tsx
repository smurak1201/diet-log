import type { Metadata } from "next";
import { SummaryCard } from "@/components/dashboard/summary-card";
import type { WorkoutPayload } from "@/components/dashboard/types";
import { PageHeader } from "@/components/page-header";
import { EmptyState, RecordCard, Row } from "@/components/record-card";
import { prisma, safeDb } from "@/lib/db";
import {
  formatDateTime,
  formatDuration,
  formatIsoDate,
  formatPace,
  getJstToday,
} from "@/lib/format";
import { deleteWorkout } from "./actions";

export const metadata: Metadata = {
  title: "運動記録 | ダイエットログ",
};

// 「今日」を毎回計算する必要があるためビルド時プレレンダリングを無効化する
// (静的生成のままだとビルド時刻で getJstToday() が固定され、todayIso が日付をまたいでも更新されない)
export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const result = await safeDb(
    () =>
      prisma.workout.findMany({
        orderBy: { date: "desc" },
      }),
    "workout.findMany",
  );

  const today = getJstToday();
  const todayIso = formatIsoDate(today);

  const workouts = result.ok ? result.data : [];
  const workoutPayload: WorkoutPayload[] = workouts.map((w) => ({
    id: w.id,
    date: w.date.toISOString(),
    distanceKm: w.distanceKm,
    durationSec: w.durationSec,
    calories: w.calories,
  }));
  // findMany は desc 取得なので最古は末尾
  const oldestIso =
    workouts.length > 0
      ? workouts[workouts.length - 1].date.toISOString()
      : null;

  return (
    <>
      <PageHeader title="運動記録" />

      <main
        id="main"
        className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col gap-6 px-4 py-6"
      >
        {result.ok && (
          <SummaryCard
            title="期間サマリー"
            workouts={workoutPayload}
            todayIso={todayIso}
            oldestIso={oldestIso}
          />
        )}

        {!result.ok ? (
          <p
            role="alert"
            className="rounded-12 border border-error-1 bg-white p-4 text-std-16N-170 text-error-1"
          >
            データの取得に失敗しました。時間をおいて再読込してください。
          </p>
        ) : result.data.length === 0 ? (
          <EmptyState message="運動記録がまだありません" />
        ) : (
          <ul className="flex flex-col gap-3">
            {result.data.map((w) => {
              const dateLabel = formatDateTime(w.date);
              return (
                <li key={w.id}>
                  <RecordCard
                    title={dateLabel}
                    deleteLabel={`${dateLabel} の運動記録`}
                    deleteAction={deleteWorkout.bind(null, w.id)}
                  >
                    <Row label="距離" value={`${w.distanceKm.toFixed(2)} km`} />
                    <Row
                      label="ペース"
                      value={`${formatPace(w.paceSecPerKm)} /km`}
                    />
                    <Row label="時間" value={formatDuration(w.durationSec)} />
                    <Row label="カロリー" value={`${w.calories} kcal`} />
                    <Row label="心拍数" value={`${w.avgHeartRate} bpm`} />
                  </RecordCard>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
