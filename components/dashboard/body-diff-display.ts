// 体組成の差分表示ヘルパー。
// 「どちらが良い方向か」というダイエット上の意味づけを 1 箇所に集約し、
// ダイエット進捗カードと体組成の期間サマリーで配色を揃える。

export function formatDiff(value: number, unit: string): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} ${unit}`;
}

// 改善方向 (体重・体脂肪率↓ / 筋肉量↑) を success、悪化方向を error にする
export function diffClass(value: number, goodDirection: "down" | "up"): string {
  if (value === 0) return "text-solid-gray-700";
  const isGood = goodDirection === "down" ? value < 0 : value > 0;
  return isGood ? "text-success-1" : "text-error-1";
}
