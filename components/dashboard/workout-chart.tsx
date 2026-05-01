"use client";

// 期間内バケット (日 or 月) の距離 [km] を棒グラフで表示

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WorkoutBucket } from "@/lib/summary";

const CHART_PRIMARY = "var(--color-primitive-blue-800)";
const CHART_GRID = "var(--color-neutral-solid-gray-200)";
const CHART_TEXT = "var(--color-neutral-solid-gray-700)";
const CHART_HOVER = "var(--color-neutral-solid-gray-100)";

type Props = { data: WorkoutBucket[] };

export default function WorkoutChart({ data }: Props) {
  return (
    <div role="img" aria-label="期間内の運動距離 (km) の棒グラフ">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="label"
            stroke={CHART_TEXT}
            tick={{ fontSize: 14 }}
            interval="preserveStartEnd"
          />
          <YAxis stroke={CHART_TEXT} tick={{ fontSize: 14 }} unit=" km" />
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
