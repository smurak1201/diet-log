// ダッシュボード用の純粋な集計関数群
// 日付は UTC ベースで扱う (lib/format.ts と同じ規約)。
// Vercel は UTC 動作なので、サーバーで生成された "今日" がユーザー体感とおおむね一致する。

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type DateRange = { from: Date; to: Date };

export type WorkoutLike = {
  date: Date;
  distanceKm: number;
  durationSec: number;
  calories: number;
};

export type BodyLike = {
  date: Date;
  weightKg: number;
  bodyFatPct: number;
};

export type WorkoutSummary = {
  count: number;
  distanceKm: number;
  durationSec: number;
  calories: number;
};

export type StreakInfo = {
  /// 連続運動日数。今日に記録が無い場合は前日からカウントする
  current: number;
  /// 今月の運動日数 (重複日は 1 とカウント)
  monthCount: number;
};

export type BodyDiff = {
  weightKg: number;
  bodyFatPct: number;
  daysElapsed: number;
};

// ---- 日付ヘルパー ---------------------------------------------------------

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function dayKey(d: Date): string {
  // YYYY-MM-DD (UTC) — Set のキーに使うため Locale 非依存
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---- 期間計算 -------------------------------------------------------------

/// 今週の範囲 (月曜 0:00 〜 翌週月曜 0:00)。日本では月曜起算が一般的なため
export function getWeekRange(today: Date): DateRange {
  const base = startOfUtcDay(today);
  // getUTCDay: 日=0, 月=1, ..., 土=6 → 月曜までのオフセット
  const offset = (base.getUTCDay() + 6) % 7;
  const from = new Date(base.getTime() - offset * MS_PER_DAY);
  const to = new Date(from.getTime() + 7 * MS_PER_DAY);
  return { from, to };
}

/// 今月の範囲 (月初 0:00 〜 翌月初 0:00)
export function getMonthRange(today: Date): DateRange {
  const from = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
  );
  const to = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1),
  );
  return { from, to };
}

// ---- 集計 -----------------------------------------------------------------

export function summarizeWorkouts(
  rows: WorkoutLike[],
  range: DateRange,
): WorkoutSummary {
  const acc: WorkoutSummary = {
    count: 0,
    distanceKm: 0,
    durationSec: 0,
    calories: 0,
  };
  for (const r of rows) {
    if (r.date < range.from || r.date >= range.to) continue;
    acc.count += 1;
    acc.distanceKm += r.distanceKm;
    acc.durationSec += r.durationSec;
    acc.calories += r.calories;
  }
  return acc;
}

export function calcStreak(rows: WorkoutLike[], today: Date): StreakInfo {
  const set = new Set(rows.map((r) => dayKey(r.date)));

  // 今日記録があればそこから、無ければ前日から数える (途切れ判定にしない)
  let cursor = startOfUtcDay(today);
  if (!set.has(dayKey(cursor))) {
    cursor = new Date(cursor.getTime() - MS_PER_DAY);
  }

  let current = 0;
  while (set.has(dayKey(cursor))) {
    current += 1;
    cursor = new Date(cursor.getTime() - MS_PER_DAY);
  }

  const monthRange = getMonthRange(today);
  const monthSet = new Set<string>();
  for (const r of rows) {
    if (r.date < monthRange.from || r.date >= monthRange.to) continue;
    monthSet.add(dayKey(r.date));
  }

  return { current, monthCount: monthSet.size };
}

export function calcBodyDiff(initial: BodyLike, latest: BodyLike): BodyDiff {
  const initialDay = startOfUtcDay(initial.date);
  const latestDay = startOfUtcDay(latest.date);
  const daysElapsed = Math.round(
    (latestDay.getTime() - initialDay.getTime()) / MS_PER_DAY,
  );
  return {
    weightKg: latest.weightKg - initial.weightKg,
    bodyFatPct: latest.bodyFatPct - initial.bodyFatPct,
    daysElapsed,
  };
}

/// 開始日からの経過日数 (ダイエット継続日数の表示に使う)
export function daysSince(startDate: Date, today: Date): number {
  const start = startOfUtcDay(startDate);
  const t = startOfUtcDay(today);
  return Math.max(
    0,
    Math.round((t.getTime() - start.getTime()) / MS_PER_DAY),
  );
}
