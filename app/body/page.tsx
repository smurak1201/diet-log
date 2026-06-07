import type { Metadata } from "next";
import {
  BodySection,
  type BodyListItem,
} from "@/components/body/body-section";
import { PageHeader } from "@/components/page-header";
import { prisma, safeDb } from "@/lib/db";
import { formatIsoDate, getJstToday } from "@/lib/format";

export const metadata: Metadata = {
  title: "体組成 | ダイエットログ",
};

// 「今日」を毎回計算する必要があるためビルド時プレレンダリングを無効化する
// (静的生成のままだとビルド時刻で getJstToday() が固定され、todayIso が日付をまたいでも更新されない)
export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const result = await safeDb(
    () =>
      prisma.bodyComposition.findMany({
        orderBy: { date: "desc" },
      }),
    "bodyComposition.findMany",
  );

  const today = getJstToday();
  const todayIso = formatIsoDate(today);

  const bodies = result.ok ? result.data : [];
  const items: BodyListItem[] = bodies.map((b) => ({
    id: b.id,
    date: b.date.toISOString(),
    weightKg: b.weightKg,
    bmi: b.bmi,
    bodyFatPct: b.bodyFatPct,
    muscleMassKg: b.muscleMassKg,
    visceralFat: b.visceralFat,
    basalMetabolism: b.basalMetabolism,
  }));
  // findMany は desc 取得なので最古は末尾
  const oldestIso =
    bodies.length > 0 ? bodies[bodies.length - 1].date.toISOString() : null;

  return (
    <>
      <PageHeader title="体組成" />

      <main
        id="main"
        className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col gap-6 px-4 py-6"
      >
        {!result.ok ? (
          <p
            role="alert"
            className="rounded-12 border border-error-1 bg-white p-4 text-std-16N-170 text-error-1"
          >
            データの取得に失敗しました。時間をおいて再読込してください。
          </p>
        ) : (
          <BodySection
            bodies={items}
            todayIso={todayIso}
            oldestIso={oldestIso}
          />
        )}
      </main>
    </>
  );
}
