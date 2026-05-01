// 開始日が登録済みのときのダイエット進捗カード
// 経過日数 + 体重/体脂肪率の初期値→最新値 + details で開始日を変更できる

import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { BodyDiff } from "@/lib/summary";
import { StartDateForm } from "./start-date-form";

type BodyMetrics = { weightKg: number; bodyFatPct: number; date: Date };

type Props = {
  startDate: Date;
  startDateIso: string;
  todayIso: string;
  daysElapsed: number;
  diff: BodyDiff;
  initial: BodyMetrics;
  latest: BodyMetrics;
};

function formatDiff(value: number, unit: string): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} ${unit}`;
}

// 体重・体脂肪率は減少が良いので、負を success・正を error に揃える
function diffClass(value: number): string {
  if (value < 0) return "text-success-1";
  if (value > 0) return "text-error-1";
  return "text-solid-gray-700";
}

export function BodyDiffCard({
  startDate,
  startDateIso,
  todayIso,
  daysElapsed,
  diff,
  initial,
  latest,
}: Props) {
  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">ダイエット進捗</h2>
      <p className="mt-1 text-std-14N-130 text-solid-gray-700">
        開始日 {formatDate(startDate)} から {daysElapsed} 日経過
        <br />
        (初期値: {formatDate(initial.date)} / 最新: {formatDate(latest.date)})
      </p>
      <hr className="my-3 border-solid-gray-200" />
      <dl className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-std-14N-130 text-solid-gray-700">体重</dt>
          <dd className="text-std-16N-170">
            {initial.weightKg.toFixed(1)}
            <span aria-hidden="true" className="mx-1 text-solid-gray-700">
              →
            </span>
            {latest.weightKg.toFixed(1)} kg
            <span
              className={cn("ml-2 text-std-16B-170", diffClass(diff.weightKg))}
            >
              ({formatDiff(diff.weightKg, "kg")})
            </span>
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-std-14N-130 text-solid-gray-700">体脂肪率</dt>
          <dd className="text-std-16N-170">
            {initial.bodyFatPct.toFixed(1)}
            <span aria-hidden="true" className="mx-1 text-solid-gray-700">
              →
            </span>
            {latest.bodyFatPct.toFixed(1)} %
            <span
              className={cn(
                "ml-2 text-std-16B-170",
                diffClass(diff.bodyFatPct),
              )}
            >
              ({formatDiff(diff.bodyFatPct, "%")})
            </span>
          </dd>
        </div>
      </dl>
      <details className="mt-4">
        <summary
          className={cn(
            "inline-flex min-h-11 cursor-pointer list-none items-center text-std-14N-130 text-blue-800",
            "hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-blue",
          )}
        >
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
  );
}
