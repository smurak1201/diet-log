"use client";

// 期間内バケット (計測日 or 月平均) の体重 / 体脂肪率を二軸の折れ線で表示

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
import type { BodyBucket } from "@/lib/summary";

const CHART_WEIGHT = "var(--color-primitive-blue-800)";
const CHART_BODY_FAT = "var(--color-primitive-magenta-1000)";
const CHART_GRID = "var(--color-neutral-solid-gray-200)";
const CHART_TEXT = "var(--color-neutral-solid-gray-700)";

type Props = { data: BodyBucket[] };

export default function BodyChart({ data }: Props) {
  return (
    <div
      role="img"
      aria-label="期間内の体重 (kg) と体脂肪率 (%) の折れ線グラフ"
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="label"
            stroke={CHART_TEXT}
            tick={{ fontSize: 14 }}
            interval="preserveStartEnd"
          />
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
