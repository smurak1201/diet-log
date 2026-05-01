"use client";

// 体重 (kg) と体脂肪率 (%) を二軸の折れ線グラフで表示

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_WEIGHT = "var(--color-primitive-blue-800)";
const CHART_BODY_FAT = "var(--color-primitive-magenta-1000)";
const CHART_GRID = "var(--color-neutral-solid-gray-200)";
const CHART_TEXT = "var(--color-neutral-solid-gray-700)";

export type BodyChartPoint = {
  date: string;
  weightKg: number;
  bodyFatPct: number;
};

type Props = { data: BodyChartPoint[] };

export default function BodyChart({ data }: Props) {
  return (
    <div
      role="img"
      aria-label="日ごとの体重 (kg) と体脂肪率 (%) の折れ線グラフ"
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis dataKey="date" stroke={CHART_TEXT} tick={{ fontSize: 14 }} />
          <YAxis
            yAxisId="weight"
            orientation="left"
            stroke={CHART_WEIGHT}
            tick={{ fontSize: 14 }}
            domain={["auto", "auto"]}
            unit=" kg"
          />
          <YAxis
            yAxisId="fat"
            orientation="right"
            stroke={CHART_BODY_FAT}
            tick={{ fontSize: 14 }}
            domain={["auto", "auto"]}
            unit=" %"
          />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 14 }} />
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weightKg"
            name="体重 (kg)"
            stroke={CHART_WEIGHT}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="fat"
            type="monotone"
            dataKey="bodyFatPct"
            name="体脂肪率 (%)"
            stroke={CHART_BODY_FAT}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
