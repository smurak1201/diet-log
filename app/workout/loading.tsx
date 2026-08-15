// 運動記録一覧の読み込み中フォールバック。
// DB 取得が完了するまで真っ白にならないよう、期間サマリー + 記録カードを模したスケルトンを表示する

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/skeleton";

export default function WorkoutLoading() {
  return (
    <>
      <PageHeader title="運動記録" />

      <main
        id="main"
        role="status"
        aria-label="読み込み中"
        className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col gap-6 px-4 py-6"
      >
        <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-3 h-9 w-full" />
          <hr className="my-3 border-solid-gray-200" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </article>

        {[0, 1].map((i) => (
          <article
            key={i}
            className="rounded-12 border border-solid-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-8 rounded-8" />
            </div>
            <hr className="my-3 border-solid-gray-200" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </article>
        ))}
      </main>
    </>
  );
}
