import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import {
  WorkoutSection,
  type WorkoutListItem,
} from "@/components/workout/workout-section";
import { prisma, safeDb } from "@/lib/db";
import { formatIsoDate, getJstToday } from "@/lib/format";

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
  const items: WorkoutListItem[] = workouts.map((w) => ({
    id: w.id,
    date: w.date.toISOString(),
    distanceKm: w.distanceKm,
    paceSecPerKm: w.paceSecPerKm,
    durationSec: w.durationSec,
    calories: w.calories,
    avgHeartRate: w.avgHeartRate,
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
        {!result.ok ? (
          <p
            role="alert"
            className="rounded-12 border border-error-1 bg-white p-4 text-std-16N-170 text-error-1"
          >
            データの取得に失敗しました。時間をおいて再読込してください。
          </p>
        ) : (
          <WorkoutSection
            workouts={items}
            todayIso={todayIso}
            oldestIso={oldestIso}
          />
        )}
      </main>
    </>
  );
}
