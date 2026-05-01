"use client";

// recharts の Client wrapper。
// ssr:false の dynamic import は Client Component 内でしか使えないため、
// この層を挟んで Server Component (page.tsx) から呼び出せるようにする。

import dynamic from "next/dynamic";
import { ChartSkeleton } from "./chart-skeleton";

export const WorkoutChart = dynamic(() => import("./workout-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export const BodyChart = dynamic(() => import("./body-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
