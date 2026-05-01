// グラフを共通シェルで包み、データが無い場合のメッセージも統一する

import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  emptyMessage: string;
  hasData: boolean;
  children: ReactNode;
};

export function ChartSection({
  title,
  description,
  emptyMessage,
  hasData,
  children,
}: Props) {
  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">{title}</h2>
      {description && (
        <p className="mt-1 text-std-14N-130 text-solid-gray-700">
          {description}
        </p>
      )}
      <hr className="my-3 border-solid-gray-200" />
      {hasData ? (
        children
      ) : (
        <p className="py-12 text-center text-std-16N-170 text-solid-gray-700">
          {emptyMessage}
        </p>
      )}
    </article>
  );
}

export function ChartSkeleton() {
  return (
    <div
      role="status"
      aria-label="グラフを読み込み中"
      className="h-60 w-full animate-pulse rounded-8 bg-solid-gray-100"
    />
  );
}
