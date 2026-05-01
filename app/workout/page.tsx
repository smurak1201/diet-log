import type { Metadata } from "next";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { prisma, safeDb } from "@/lib/db";
import {
  formatDateTime,
  formatDuration,
  formatPace,
} from "@/lib/format";
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
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {result.data.map((w) => {
              const dateLabel = formatDateTime(w.date);
              return (
                <li key={w.id}>
                  <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
                    <header className="flex items-center justify-between gap-2">
                      <h2 className="text-std-18B-160">{dateLabel}</h2>
                      <DeleteConfirmDialog
                        label={`${dateLabel} の運動記録`}
                        action={deleteWorkout.bind(null, w.id)}
                      />
                    </header>
                    <hr className="my-3 border-solid-gray-200" />
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                      <Row label="距離" value={`${w.distanceKm.toFixed(2)} km`} />
                      <Row
                        label="ペース"
                        value={`${formatPace(w.paceSecPerKm)} /km`}
                      />
                      <Row
                        label="時間"
                        value={formatDuration(w.durationSec)}
                      />
                      <Row label="カロリー" value={`${w.calories} kcal`} />
                      <Row label="心拍数" value={`${w.avgHeartRate} bpm`} />
                    </dl>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-std-14N-130 text-solid-gray-700">{label}</dt>
      <dd className="text-std-16N-170">{value}</dd>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-12 border border-solid-gray-200 bg-white p-8 text-center">
      <p className="text-std-16N-170 text-solid-gray-700">
        運動記録がまだありません
      </p>
      <Link
        href="/entry"
        className="inline-flex min-h-11 items-center gap-2 rounded-8 bg-blue-800 px-4 text-std-16B-170 text-white transition-all hover:bg-blue-900 active:translate-y-px active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue"
      >
        <span className="material-symbols-outlined" aria-hidden>
          add_circle
        </span>
        データを登録する
      </Link>
    </div>
  );
}
