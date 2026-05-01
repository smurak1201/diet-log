import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { EmptyState, RecordCard, Row } from "@/components/record-card";
import { prisma, safeDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteBodyComposition } from "./actions";

export const metadata: Metadata = {
  title: "体組成 | ダイエットログ",
};

export default async function BodyPage() {
  const result = await safeDb(
    () =>
      prisma.bodyComposition.findMany({
        orderBy: { date: "desc" },
      }),
    "bodyComposition.findMany",
  );

  return (
    <>
      <PageHeader title="体組成" />

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
          <EmptyState message="体組成記録がまだありません" />
        ) : (
          <ul className="flex flex-col gap-3">
            {result.data.map((b) => {
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
                    <Row
                      label="体脂肪率"
                      value={`${b.bodyFatPct.toFixed(1)} %`}
                    />
                    <Row
                      label="筋肉量"
                      value={`${b.muscleMassKg.toFixed(1)} kg`}
                    />
                    <Row label="内臓脂肪" value={b.visceralFat.toFixed(1)} />
                    <Row
                      label="基礎代謝"
                      value={`${b.basalMetabolism} kcal`}
                    />
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
