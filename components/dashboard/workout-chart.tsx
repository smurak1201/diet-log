"use client";

// 日ごとの運動距離 (km) を棒グラフで表示
// recharts は Client 専用 (SVG を window 依存で計算するため動的 import で読み込む)

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// DADS の primitive 変数を直接参照 (生 hex 禁止のため CSS 変数を文字列で渡す)
const CHART_PRIMARY = "var(--color-primitive-blue-800)";
const CHART_GRID = "var(--color-neutral-solid-gray-200)";
const CHART_TEXT = "var(--color-neutral-solid-gray-700)";
const CHART_HOVER = "var(--color-neutral-solid-gray-100)";

export type WorkoutChartPoint = {
  date: string;
  distanceKm: number;
};

type Props = { data: WorkoutChartPoint[] };

export default function WorkoutChart({ data }: Props) {
  return (
    <div role="img" aria-label="日ごとの運動距離 (km) の棒グラフ">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="date"
            stroke={CHART_TEXT}
            tick={{ fontSize: 14 }}
          />
          <YAxis
            stroke={CHART_TEXT}
            tick={{ fontSize: 14 }}
            unit=" km"
          />
          <Tooltip
            cursor={{ fill: CHART_HOVER }}
            formatter={(value: number) => [`${value.toFixed(2)} km`, "距離"]}
          />
          <Bar dataKey="distanceKm" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
