// 体組成 1 指標を「初期値 → 最新値 (差分)」の 4 セルで表示する行。
// ダイエット進捗カードと体組成の期間サマリーで共有する。
// Fragment で返すことで親 grid (grid-cols-[auto_1fr_auto_auto]) の直接の子になり、列が全行で揃う。

import { cn } from "@/lib/cn";
import { diffClass, formatDiff } from "./body-diff-display";

type Props = {
  label: string;
  /// 基準値。省略時 (計測 1 回など) は「最新値のみ」を矢印なしで表示
  initial?: number | null;
  /// 最新値。データが無いとき null
  latest: number | null;
  /// 差分。出せないとき (計測 2 件未満) は null → 差分セルは空
  diff: number | null;
  unit: string;
  goodDirection: "down" | "up";
};

export function BodyMetricRow({
  label,
  initial,
  latest,
  diff,
  unit,
  goodDirection,
}: Props) {
  return (
    <>
      <dt className="text-std-14N-130 text-solid-gray-700">{label}</dt>
      <dd className="text-std-16N-170 text-right tabular-nums">
        {latest === null ? (
          "−"
        ) : initial == null ? (
          latest.toFixed(1)
        ) : (
          <>
            {initial.toFixed(1)}
            <span aria-hidden="true" className="mx-2 text-solid-gray-700">
              →
            </span>
            {latest.toFixed(1)}
          </>
        )}
      </dd>
      <dd className="text-std-16N-170">{unit}</dd>
      <dd
        className={cn(
          "ml-2 text-std-16B-170 tabular-nums",
          diff !== null && diffClass(diff, goodDirection),
        )}
      >
        {diff !== null ? `(${formatDiff(diff, unit)})` : ""}
      </dd>
    </>
  );
}
