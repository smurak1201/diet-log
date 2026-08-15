// loading.tsx で使う汎用パルスブロック。装飾目的のため aria-hidden にし、
// 読み上げは呼び出し側のコンテナに role="status" + aria-label をまとめて付ける

import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-8 bg-solid-gray-100", className)}
    />
  );
}
