import type { Metadata } from "next";
import { EmptyState, RecordCard, Row } from "@/components/record-card";
import { prisma, safeDb } from "@/lib/db";
import { formatDateTime, formatDuration, formatPace } from "@/lib/format";
import { deleteWorkout } from "./actions";

export const metadata: Metadata = {
  title: "運動記録 | ダイエットログ",
};

export default async function WorkoutPage() {
  const result = await safeDb(
    () =>
      prisma.workout.findMany({
        orderBy: { date: "desc" },
      }),
    "workout.findMany",
  );

  return (
    <>
      <header className="w-full border-b border-solid-gray-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center px-4">
          <h1 className="text-std-16B-170">運動記録</h1>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto w-full max-w-screen-sm flex-1 px-4 py-6"
      >
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
