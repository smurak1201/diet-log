import type { Metadata } from "next";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
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
      <header className="w-full border-b border-solid-gray-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center px-4">
          <h1 className="text-std-16B-170">体組成</h1>
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
            {result.data.map((b) => {
              const dateLabel = formatDate(b.date);
              return (
                <li key={b.id}>
                  <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
                    <header className="flex items-center justify-between gap-2">
                      <h2 className="text-std-18B-160">{dateLabel}</h2>
                      <DeleteConfirmDialog
                        label={`${dateLabel} の体組成記録`}
                        action={deleteBodyComposition.bind(null, b.id)}
                      />
                    </header>
                    <hr className="my-3 border-solid-gray-200" />
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                      <Row label="体重" value={`${b.weightKg.toFixed(1)} kg`} />
                      <Row
                        label="体脂肪率"
                        value={`${b.bodyFatPct.toFixed(1)} %`}
                      />
                      <Row
                        label="筋肉量"
                        value={`${b.muscleMassKg.toFixed(1)} kg`}
                      />
                      <Row
                        label="内臓脂肪"
                        value={b.visceralFat.toFixed(1)}
                      />
                      <Row
                        label="基礎代謝"
                        value={`${b.basalMetabolism} kcal`}
                      />
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
        体組成記録がまだありません
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
