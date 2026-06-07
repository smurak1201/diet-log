// 開始日が登録済みのときのダイエット進捗カード
// 経過日数 + 体重/体脂肪率の初期値→最新値 + details で開始日を変更できる

import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { BodyDiff } from "@/lib/summary";
import { BodyMetricRow } from "./body-metric-row";
import { StartDateForm } from "./start-date-form";

type BodyMetrics = {
  weightKg: number;
  bodyFatPct: number;
  muscleMassKg: number;
  date: Date;
};

type Props = {
  startDate: Date;
  startDateIso: string;
  todayIso: string;
  daysElapsed: number;
  diff: BodyDiff;
  initial: BodyMetrics;
  latest: BodyMetrics;
};

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
      {/* 桁を揃えるため grid + tabular-nums (同幅数字) を使う */}
      <dl className="grid grid-cols-[auto_1fr_auto_auto] items-baseline gap-x-2 gap-y-3">
        <BodyMetricRow
          label="体重"
          initial={initial.weightKg}
          latest={latest.weightKg}
          diff={diff.weightKg}
          unit="kg"
          goodDirection="down"
        />
        <BodyMetricRow
          label="体脂肪率"
          initial={initial.bodyFatPct}
          latest={latest.bodyFatPct}
          diff={diff.bodyFatPct}
          unit="%"
          goodDirection="down"
        />
        <BodyMetricRow
          label="筋肉量"
          initial={initial.muscleMassKg}
          latest={latest.muscleMassKg}
          diff={diff.muscleMassKg}
          unit="kg"
          goodDirection="up"
        />
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
