"use client";

// 体組成ページの本体。期間サマリーと記録一覧を 1 つの期間 state で連動させる。
// 体組成は状態値なので合計せず、期間内の「変化量」(最初→最後の計測の差分) をサマリーに出す。

import { deleteBodyComposition } from "@/app/body/actions";
import { BodyMetricRow } from "@/components/dashboard/body-metric-row";
import { RangePeriodControl } from "@/components/dashboard/range-period-control";
import { useRangeState } from "@/components/dashboard/use-range-state";
import { EmptyState, RecordCard, Row } from "@/components/record-card";
import { formatDate } from "@/lib/format";
import { getBodyMetrics } from "@/lib/summary";

// 一覧表示に必要な全項目を含む serializable な体組成記録 (Date は ISO 文字列で運ぶ)
export type BodyListItem = {
  id: string;
  date: string;
  weightKg: number;
  bmi: number;
  bodyFatPct: number;
  muscleMassKg: number;
  visceralFat: number;
  basalMetabolism: number;
};

type Props = {
  bodies: BodyListItem[];
  todayIso: string;
  oldestIso: string | null;
};

export function BodySection({ bodies, todayIso, oldestIso }: Props) {
  const today = new Date(todayIso);
  const oldestDate = oldestIso ? new Date(oldestIso) : null;
  const bodiesWithDate = bodies.map((b) => ({ ...b, date: new Date(b.date) }));

  const { type, range, canPrev, canNext, setType, prev, next } = useRangeState({
    today,
    oldestDate,
  });

  const metrics = getBodyMetrics(bodiesWithDate, range);
  const inRange = bodiesWithDate.filter(
    (b) => b.date >= range.from && b.date < range.to,
  );

  return (
    <>
      <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
        <h2 className="text-std-18B-160">期間サマリー</h2>
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
        <p className="mb-3 text-std-14N-130 text-solid-gray-700">
          {metrics.count === 0
            ? "この期間の計測データはありません"
            : `期間内の計測: ${metrics.count} 回`}
        </p>
        {metrics.count > 0 && (
          // 桁を揃えるため grid + tabular-nums (同幅数字) を使う
          <dl className="grid grid-cols-[auto_1fr_auto_auto] items-baseline gap-x-2 gap-y-3">
            <BodyMetricRow
              label="体重"
              initial={metrics.initial?.weightKg}
              latest={metrics.latest?.weightKg ?? null}
              diff={metrics.diff?.weightKg ?? null}
              unit="kg"
              goodDirection="down"
            />
            <BodyMetricRow
              label="体脂肪率"
              initial={metrics.initial?.bodyFatPct}
              latest={metrics.latest?.bodyFatPct ?? null}
              diff={metrics.diff?.bodyFatPct ?? null}
              unit="%"
              goodDirection="down"
            />
            <BodyMetricRow
              label="筋肉量"
              initial={metrics.initial?.muscleMassKg}
              latest={metrics.latest?.muscleMassKg ?? null}
              diff={metrics.diff?.muscleMassKg ?? null}
              unit="kg"
              goodDirection="up"
            />
          </dl>
        )}
      </article>

      {bodies.length === 0 ? (
        <EmptyState message="体組成記録がまだありません" />
      ) : inRange.length === 0 ? (
        <p className="flex min-h-11 items-center justify-center rounded-12 border border-solid-gray-200 bg-white p-8 text-std-16N-170 text-solid-gray-700">
          この期間の体組成記録はありません
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {inRange.map((b) => {
            const dateLabel = formatDate(b.date);
            return (
              <li key={b.id}>
                <RecordCard
                  title={dateLabel}
                  deleteLabel={`${dateLabel} の体組成記録`}
                  deleteAction={deleteBodyComposition.bind(null, b.id)}
                >
                  <Row label="体重" value={`${b.weightKg.toFixed(1)} kg`} />
                  <Row label="BMI" value={b.bmi.toFixed(1)} />
                  <Row label="体脂肪率" value={`${b.bodyFatPct.toFixed(1)} %`} />
                  <Row label="筋肉量" value={`${b.muscleMassKg.toFixed(1)} kg`} />
                  <Row label="内臓脂肪" value={b.visceralFat.toFixed(1)} />
                  <Row label="基礎代謝" value={`${b.basalMetabolism} kcal`} />
                </RecordCard>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
