// ダッシュボード (/) の読み込み中フォールバック。
// DB 取得が完了するまで真っ白にならないよう、page.tsx の3カード構成を模したスケルトンを表示する

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/skeleton";

export default function HomeLoading() {
  return (
    <>
      <PageHeader title="ダイエットログ" />

      <main
        id="main"
        role="status"
        aria-label="読み込み中"
        className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col gap-6 px-4 py-6"
      >
        <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-4 w-56" />
          <hr className="my-3 border-solid-gray-200" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </article>

        <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-3 h-9 w-full" />
          <hr className="my-3 border-solid-gray-200" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="mt-4 h-60 w-full" />
        </article>

        <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-3 h-9 w-full" />
          <hr className="my-3 border-solid-gray-200" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="mt-4 h-60 w-full" />
        </article>
      </main>
    </>
  );
}
