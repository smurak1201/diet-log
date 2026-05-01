// recharts を dynamic import するときの loading プレースホルダ

export function ChartSkeleton() {
  return (
    <div
      role="status"
      aria-label="グラフを読み込み中"
      className="h-60 w-full animate-pulse rounded-8 bg-solid-gray-100"
    />
  );
}
