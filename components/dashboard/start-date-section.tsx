// 開始日 未登録時に表示するセクション (シェル + 説明 + フォーム)

import { StartDateForm } from "./start-date-form";

type Props = { todayIso: string };

export function StartDateSection({ todayIso }: Props) {
  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">ダイエット開始日</h2>
      <p className="mt-1 text-std-14N-130 text-solid-gray-700">
        開始日を登録すると、その日 (またはそれ以降最初) の体組成を初期値として最新との差分を表示します。
      </p>
      <div className="mt-4">
        <StartDateForm
          todayIso={todayIso}
          submitLabel="開始日を登録"
          successMessage="ダイエット開始日を登録しました"
        />
      </div>
    </article>
  );
}
