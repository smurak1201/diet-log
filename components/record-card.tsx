// 一覧ページ共通の記録カード / 行 / 空状態
//
// - RecordCard: 日付ヘッダ + 削除ボタン + 区切り線 + 指標グリッド (children に Row を入れる)
// - Row: ラベル/値ペア (RecordCard 内の <dl> 子要素として使う前提)
// - EmptyState: 記録 0 件時の表示 (登録画面への CTA 付き)

import Link from "next/link";
import type { ReactNode } from "react";
import {
  DeleteConfirmDialog,
  type DeleteResult,
} from "./delete-confirm-dialog";

type RecordCardProps = {
  title: string;
  deleteLabel: string;
  deleteAction: () => Promise<DeleteResult>;
  children: ReactNode;
};

export function RecordCard({
  title,
  deleteLabel,
  deleteAction,
  children,
}: RecordCardProps) {
  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-std-18B-160">{title}</h2>
        <DeleteConfirmDialog label={deleteLabel} action={deleteAction} />
      </header>
      <hr className="my-3 border-solid-gray-200" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
    </article>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-std-14N-130 text-solid-gray-700">{label}</dt>
      <dd className="text-std-16N-170">{value}</dd>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-12 border border-solid-gray-200 bg-white p-8 text-center">
      <p className="text-std-16N-170 text-solid-gray-700">{message}</p>
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
