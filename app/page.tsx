// ダッシュボード (/)
// データ取得 → 集計 → 各セクションを縦に並べる Server Component

import type { Metadata } from "next";
import { BodyDiffCard } from "@/components/dashboard/body-diff-card";
import {
  ChartSection,
} from "@/components/dashboard/chart-section";
import { BodyChart, WorkoutChart } from "@/components/dashboard/charts";
import { StartDateForm } from "@/components/dashboard/start-date-form";
import { StartDateSection } from "@/components/dashboard/start-date-section";
import { StreakCard } from "@/components/dashboard/streak-card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { prisma, safeDb } from "@/lib/db";
import {
  formatChartDate,
  formatDate,
  formatIsoDate,
} from "@/lib/format";
import { SETTING_KEYS } from "@/lib/settings";
import {
  calcBodyDiff,
  calcStreak,
  daysSince,
  getMonthRange,
  getWeekRange,
  summarizeWorkouts,
} from "@/lib/summary";

export const metadata: Metadata = {
  title: "ダッシュボード | ダイエットログ",
};

const CHART_LOOKBACK_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default async function HomePage() {
  const today = new Date();
  const lookbackFrom = new Date(
    today.getTime() - CHART_LOOKBACK_DAYS * MS_PER_DAY,
  );

  const [workoutResult, bodyResult, settingResult] = await Promise.all([
    safeDb(
      () =>
        prisma.workout.findMany({
          where: { date: { gte: lookbackFrom } },
          orderBy: { date: "asc" },
        }),
      "dashboard.workout.findMany",
    ),
    safeDb(
      () =>
        prisma.bodyComposition.findMany({
          where: { date: { gte: lookbackFrom } },
          orderBy: { date: "asc" },
        }),
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

  const hasError =
    !workoutResult.ok || !bodyResult.ok || !settingResult.ok;

  // 開始日が登録済みなら、開始日以降の最初の体組成と、最新の体組成を取得
  // (90 日窓に開始日が含まれないケースに備え、専用クエリで取り直す)
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

  // 集計
  const todayIso = formatIsoDate(today);
  const startDateIso = startDate ? formatIsoDate(startDate) : "";
  const weekRange = getWeekRange(today);
  const monthRange = getMonthRange(today);

  const workouts = workoutResult.ok ? workoutResult.data : [];
  const bodies = bodyResult.ok ? bodyResult.data : [];

  const weekSummary = summarizeWorkouts(workouts, weekRange);
  const monthSummary = summarizeWorkouts(workouts, monthRange);
  const streak = calcStreak(workouts, today);

  // 同じ日に複数回運動している場合は距離を合算してチャートのバーを 1 本にする
  const workoutByDay = new Map<string, number>();
  for (const w of workouts) {
    const key = formatChartDate(w.date);
    workoutByDay.set(key, (workoutByDay.get(key) ?? 0) + w.distanceKm);
  }
  const workoutChartData = Array.from(workoutByDay.entries()).map(
    ([date, distanceKm]) => ({ date, distanceKm }),
  );

  const bodyChartData = bodies.map((b) => ({
    date: formatChartDate(b.date),
    weightKg: b.weightKg,
    bodyFatPct: b.bodyFatPct,
  }));

  const weekRangeLabel = `${formatChartDate(weekRange.from)} - ${formatChartDate(
    new Date(weekRange.to.getTime() - MS_PER_DAY),
  )}`;
  const monthRangeLabel = `${today.getUTCFullYear()}/${String(
    today.getUTCMonth() + 1,
  ).padStart(2, "0")}`;

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

        <section
          aria-labelledby="summary-heading"
          className="flex flex-col gap-4"
        >
          <h2 id="summary-heading" className="sr-only">
            期間サマリー
          </h2>
          <SummaryCard
            title="今週"
            rangeLabel={weekRangeLabel}
            summary={weekSummary}
          />
          <SummaryCard
            title="今月"
            rangeLabel={monthRangeLabel}
            summary={monthSummary}
          />
        </section>

        <section aria-labelledby="streak-heading">
          <h2 id="streak-heading" className="sr-only">
            継続状況
          </h2>
          <StreakCard streak={streak} />
        </section>

        <section aria-labelledby="workout-chart-heading">
          <h2 id="workout-chart-heading" className="sr-only">
            運動グラフ
          </h2>
          <ChartSection
            title="運動 (直近 90 日)"
            description="日ごとの距離 (km) の合計"
            emptyMessage="まだ運動記録がありません"
            hasData={workoutChartData.length > 0}
          >
            <WorkoutChart data={workoutChartData} />
          </ChartSection>
        </section>

        <section aria-labelledby="body-chart-heading">
          <h2 id="body-chart-heading" className="sr-only">
            体組成推移
          </h2>
          <ChartSection
            title="体組成推移 (直近 90 日)"
            description="体重 (左軸) と体脂肪率 (右軸)"
            emptyMessage="まだ体組成記録がありません"
            hasData={bodyChartData.length > 0}
          >
            <BodyChart data={bodyChartData} />
          </ChartSection>
        </section>
      </main>
    </>
  );
}
