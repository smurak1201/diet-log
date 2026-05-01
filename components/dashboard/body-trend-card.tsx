"use client";

// ホームの体組成カード。期間切替 + 簡易メトリック + 折れ線グラフ

import { bucketBodies } from "@/lib/summary";
import { BodyChart } from "./charts";
import { RangePeriodControl } from "./range-period-control";
import { Stat } from "./stat";
import type { BodyPayload } from "./types";
import { useRangeState } from "./use-range-state";

type Props = {
  bodies: BodyPayload[];
  todayIso: string;
  oldestIso: string | null;
};

export function BodyTrendCard({ bodies, todayIso, oldestIso }: Props) {
  const today = new Date(todayIso);
  const oldestDate = oldestIso ? new Date(oldestIso) : null;
  const bodiesWithDate = bodies.map((b) => ({ ...b, date: new Date(b.date) }));

  const { type, range, canPrev, canNext, setType, prev, next } = useRangeState({
    today,
    oldestDate,
  });
  const buckets = bucketBodies(bodiesWithDate, range);

  // 折れ線にプロットされた点 = 期間内に計測 (週/月) or 平均値が出た月 (年/all)
  const pointCount = buckets.length;
  const avgWeight =
    pointCount > 0
      ? buckets.reduce((s, b) => s + b.weightKg, 0) / pointCount
      : null;
  const avgBodyFat =
    pointCount > 0
      ? buckets.reduce((s, b) => s + b.bodyFatPct, 0) / pointCount
      : null;

  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">体組成</h2>
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
        <Stat
          label="平均体重"
          value={avgWeight !== null ? `${avgWeight.toFixed(1)} kg` : "-"}
        />
        <Stat
          label="平均体脂肪率"
          value={avgBodyFat !== null ? `${avgBodyFat.toFixed(1)} %` : "-"}
        />
      </dl>
      <div className="mt-4">
        {pointCount > 0 ? (
          <BodyChart data={buckets} />
        ) : (
          <p className="py-12 text-center text-std-16N-170 text-solid-gray-700">
            この期間の体組成記録はありません
          </p>
        )}
      </div>
    </article>
  );
}
