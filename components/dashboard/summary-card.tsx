// 期間内 (今週 / 今月) の運動サマリーカード

import { formatDuration } from "@/lib/format";
import type { WorkoutSummary } from "@/lib/summary";

type Props = {
  title: string;
  rangeLabel: string;
  summary: WorkoutSummary;
};

export function SummaryCard({ title, rangeLabel, summary }: Props) {
  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-std-18B-160">{title}</h2>
        <span className="text-std-14N-130 text-solid-gray-700">
          {rangeLabel}
        </span>
      </header>
      <hr className="my-3 border-solid-gray-200" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat label="運動回数" value={`${summary.count} 回`} />
        <Stat label="合計距離" value={`${summary.distanceKm.toFixed(2)} km`} />
        <Stat label="合計時間" value={formatDuration(summary.durationSec)} />
        <Stat label="消費カロリー" value={`${summary.calories} kcal`} />
      </dl>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-std-14N-130 text-solid-gray-700">{label}</dt>
      <dd className="text-std-18B-160">{value}</dd>
    </div>
  );
}
