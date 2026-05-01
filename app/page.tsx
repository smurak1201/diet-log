// ダッシュボード (/)
// データ取得 → 各セクションを縦に並べる Server Component。
// 期間切替が必要なカードには workout / body を全件 ISO 化して props で渡す。

import type { Metadata } from "next";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { BodyDiffCard } from "@/components/dashboard/body-diff-card";
import { BodyTrendCard } from "@/components/dashboard/body-trend-card";
import { StartDateForm } from "@/components/dashboard/start-date-form";
import { StartDateSection } from "@/components/dashboard/start-date-section";
import { StreakCard } from "@/components/dashboard/streak-card";
import type {
  BodyPayload,
  WorkoutPayload,
} from "@/components/dashboard/types";
import { prisma, safeDb } from "@/lib/db";
import { formatDate, formatIsoDate, getJstToday } from "@/lib/format";
import { SETTING_KEYS } from "@/lib/settings";
import { calcBodyDiff, calcStreak, daysSince } from "@/lib/summary";

export const metadata: Metadata = {
  title: "ダッシュボード | ダイエットログ",
};

export default async function HomePage() {
  const today = getJstToday();

  const [workoutResult, bodyResult, settingResult] = await Promise.all([
    safeDb(
      () => prisma.workout.findMany({ orderBy: { date: "asc" } }),
      "dashboard.workout.findMany",
    ),
    safeDb(
      () => prisma.bodyComposition.findMany({ orderBy: { date: "asc" } }),
      "dashboard.bodyComposition.findMany",
    ),
    safeDb(
      () =>
        prisma.setting.findUnique({
          where: { key: SETTING_KEYS.dietStartDate },
        }),
      "dashboard.setting.findUnique",
    ),
  ]);

  const hasError = !workoutResult.ok || !bodyResult.ok || !settingResult.ok;

  // 開始日が登録済みなら、開始日以降の最初の体組成と最新の体組成を取得
  let startDate: Date | null = null;
  let initialBody:
    | { date: Date; weightKg: number; bodyFatPct: number }
    | null = null;
  let latestBody:
    | { date: Date; weightKg: number; bodyFatPct: number }
    | null = null;

  if (settingResult.ok && settingResult.data) {
    startDate = new Date(`${settingResult.data.value}T00:00:00Z`);
    const startDateRef = startDate;

    const [initialResult, latestResult] = await Promise.all([
      safeDb(
        () =>
          prisma.bodyComposition.findFirst({
            where: { date: { gte: startDateRef } },
            orderBy: { date: "asc" },
          }),
        "dashboard.bodyComposition.initial",
      ),
      safeDb(
        () =>
          prisma.bodyComposition.findFirst({
            orderBy: { date: "desc" },
          }),
        "dashboard.bodyComposition.latest",
      ),
    ]);

    if (initialResult.ok && initialResult.data) initialBody = initialResult.data;
    if (latestResult.ok && latestResult.data) latestBody = latestResult.data;
  }

  const todayIso = formatIsoDate(today);
  const startDateIso = startDate ? formatIsoDate(startDate) : "";

  const workouts = workoutResult.ok ? workoutResult.data : [];
  const bodies = bodyResult.ok ? bodyResult.data : [];

  const streak = calcStreak(workouts, today);

  // 期間切替カード用のシリアライズ済みデータ (date は ISO 文字列)
  const workoutPayload: WorkoutPayload[] = workouts.map((w) => ({
    id: w.id,
    date: w.date.toISOString(),
    distanceKm: w.distanceKm,
    durationSec: w.durationSec,
    calories: w.calories,
  }));
  const bodyPayload: BodyPayload[] = bodies.map((b) => ({
    id: b.id,
    date: b.date.toISOString(),
    weightKg: b.weightKg,
    bodyFatPct: b.bodyFatPct,
  }));

  // workouts / bodies は asc ソート済みなので先頭が最古
  const oldestWorkoutIso = workouts[0]?.date.toISOString() ?? null;
  const oldestBodyIso = bodies[0]?.date.toISOString() ?? null;

  // 進捗カード表示の分岐:
  // 1. 開始日 未登録 → StartDateSection
  // 2. 開始日 登録済 + 開始日以降の体組成あり → BodyDiffCard
  // 3. 開始日 登録済 だが体組成なし → 案内文 + 開始日変更フォーム
  const showBodyDiff =
    startDate !== null && initialBody !== null && latestBody !== null;
  const startDateSetButNoBody =
    startDate !== null && (initialBody === null || latestBody === null);

  return (
    <>
      <header className="w-full border-b border-solid-gray-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center px-4">
          <h1 className="text-std-16B-170">ダイエットログ</h1>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col gap-6 px-4 py-6"
      >
        {hasError && (
          <p
            role="alert"
            className="rounded-12 border border-error-1 bg-white p-4 text-std-16N-170 text-error-1"
          >
            一部のデータ取得に失敗しました。時間をおいて再読込してください。
          </p>
        )}

        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">
            ダイエット進捗
          </h2>
          {showBodyDiff && initialBody && latestBody && startDate ? (
            <BodyDiffCard
              startDate={startDate}
              startDateIso={startDateIso}
              todayIso={todayIso}
              daysElapsed={daysSince(startDate, today)}
              diff={calcBodyDiff(initialBody, latestBody)}
              initial={initialBody}
              latest={latestBody}
            />
          ) : startDateSetButNoBody && startDate ? (
            <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
              <h2 className="text-std-18B-160">ダイエット進捗</h2>
              <p className="mt-3 text-std-16N-170 text-solid-gray-700">
                開始日 {formatDate(startDate)} 以降の体組成記録がまだありません。体組成を登録すると差分が表示されます。
              </p>
              <details className="mt-4">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-std-14N-130 text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue">
                  開始日を変更する
                </summary>
                <div className="mt-3">
                  <StartDateForm
                    todayIso={todayIso}
                    defaultValue={startDateIso}
                    submitLabel="開始日を更新"
                    successMessage="ダイエット開始日を更新しました"
                  />
                </div>
              </details>
            </article>
          ) : (
            <StartDateSection todayIso={todayIso} />
          )}
        </section>

        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="sr-only">
            運動
          </h2>
          <ActivityCard
            workouts={workoutPayload}
            todayIso={todayIso}
            oldestIso={oldestWorkoutIso}
          />
        </section>

        <section aria-labelledby="body-trend-heading">
          <h2 id="body-trend-heading" className="sr-only">
            体組成
          </h2>
          <BodyTrendCard
            bodies={bodyPayload}
            todayIso={todayIso}
            oldestIso={oldestBodyIso}
          />
        </section>
      </main>
    </>
  );
}
