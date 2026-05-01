// 連続運動日数 + 今月の運動日数

import type { StreakInfo } from "@/lib/summary";

type Props = { streak: StreakInfo };

export function StreakCard({ streak }: Props) {
  return (
    <article className="rounded-12 border border-solid-gray-200 bg-white p-4">
      <h2 className="text-std-18B-160">継続状況</h2>
      <hr className="my-3 border-solid-gray-200" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat label="連続運動日数" value={streak.current} />
        <Stat label="今月の運動日数" value={streak.monthCount} />
      </dl>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-std-14N-130 text-solid-gray-700">{label}</dt>
      <dd className="text-std-24B-150 text-blue-800">
        {value}
        <span className="ml-1 text-std-16N-170 text-solid-gray-700">日</span>
      </dd>
    </div>
  );
}
