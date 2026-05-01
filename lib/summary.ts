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

// ---- 期間切替 (週/月/年/すべて) -------------------------------------------

export type RangeType = "week" | "month" | "year" | "all";

export type RangeContext = {
  type: RangeType;
  /// 範囲開始 (含む)
  from: Date;
  /// 範囲終了 (含まない)
  to: Date;
  /// "2026年4月" など、表示用ラベル
  label: string;
};

export type WorkoutMetrics = WorkoutSummary & {
  /// 平均ペース (秒/km)。距離 0 のとき null
  avgPaceSecPerKm: number | null;
};

export type WorkoutBucket = {
  label: string;
  distanceKm: number;
};

export type BodyBucket = {
  label: string;
  weightKg: number;
  bodyFatPct: number;
};

function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function startOfUtcYear(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayBucketLabel(d: Date, type: RangeType): string {
  // 月モードは「日」のみ (棒の本数が多いので簡潔に)、週モードは "M/D"
  if (type === "month") return String(d.getUTCDate());
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function monthBucketLabel(d: Date, type: RangeType): string {
  // 年モードは "M月"、すべてモードは "YYYY/MM" で年も含める
  if (type === "year") return `${d.getUTCMonth() + 1}月`;
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function listDaysInRange(range: DateRange): Date[] {
  const days: Date[] = [];
  const from = startOfUtcDay(range.from).getTime();
  const to = startOfUtcDay(range.to).getTime();
  for (let t = from; t < to; t += MS_PER_DAY) {
    days.push(new Date(t));
  }
  return days;
}

function listMonthsInRange(range: DateRange): Date[] {
  const months: Date[] = [];
  let cursor = startOfUtcMonth(range.from);
  const limit = startOfUtcMonth(range.to);
  while (cursor < limit) {
    months.push(cursor);
    cursor = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1),
    );
  }
  return months;
}

function average(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/// 1 年の範囲 (1/1 0:00 〜 翌年 1/1 0:00)
export function getYearRange(today: Date): DateRange {
  const from = startOfUtcYear(today);
  const to = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1));
  return { from, to };
}

/// RangeType と基準日から range + ラベルを返す。
/// "all" は記録の最古月から今月までを範囲とする (oldestDate が無ければ baseDate 当年から)
export function getRange(
  type: RangeType,
  baseDate: Date,
  oldestDate: Date | null,
): RangeContext {
  if (type === "week") {
    const r = getWeekRange(baseDate);
    const lastDay = new Date(r.to.getTime() - MS_PER_DAY);
    return {
      type,
      ...r,
      label: `${r.from.getUTCMonth() + 1}/${r.from.getUTCDate()} - ${lastDay.getUTCMonth() + 1}/${lastDay.getUTCDate()}`,
    };
  }
  if (type === "month") {
    const r = getMonthRange(baseDate);
    return {
      type,
      ...r,
      label: `${baseDate.getUTCFullYear()}年${baseDate.getUTCMonth() + 1}月`,
    };
  }
  if (type === "year") {
    const r = getYearRange(baseDate);
    return {
      type,
      ...r,
      label: `${baseDate.getUTCFullYear()}年`,
    };
  }
  // "all"
  const from = oldestDate ? startOfUtcMonth(oldestDate) : startOfUtcYear(baseDate);
  const to = new Date(
    Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + 1, 1),
  );
  return { type, from, to, label: "すべての期間" };
}

/// ◀/▶ で baseDate を 1 単位 (週/月/年) 移動した日付を返す。"all" は移動しない
export function shiftBaseDate(
  type: RangeType,
  baseDate: Date,
  direction: -1 | 1,
): Date {
  const d = startOfUtcDay(baseDate);
  if (type === "week") {
    return new Date(d.getTime() + direction * 7 * MS_PER_DAY);
  }
  if (type === "month") {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + direction, 1),
    );
  }
  if (type === "year") {
    return new Date(Date.UTC(d.getUTCFullYear() + direction, 0, 1));
  }
  return d;
}

/// 移動先の期間が表示可能か (過去は oldestDate 以前、未来は today より先を弾く)
export function canShift(
  type: RangeType,
  baseDate: Date,
  direction: -1 | 1,
  oldestDate: Date | null,
  today: Date,
): boolean {
  if (type === "all") return false;
  const nextBase = shiftBaseDate(type, baseDate, direction);
  const nextRange = getRange(type, nextBase, oldestDate);
  if (direction === -1) {
    if (!oldestDate) return false;
    // 移動先範囲が oldestDate 以降を一部でも含むなら OK
    return nextRange.to > startOfUtcDay(oldestDate);
  }
  // 移動先範囲が今日を含むか過去なら OK
  return nextRange.from <= startOfUtcDay(today);
}

// ---- 期間内バケット集計 ---------------------------------------------------

/// 棒グラフ用バケット。週/月 → 日単位、年/すべて → 月単位の合計距離
export function bucketWorkouts(
  rows: WorkoutLike[],
  range: RangeContext,
): WorkoutBucket[] {
  const isMonthly = range.type === "year" || range.type === "all";

  if (isMonthly) {
    const months = listMonthsInRange(range);
    const sums = new Map<string, number>();
    for (const m of months) sums.set(monthKey(m), 0);
    for (const r of rows) {
      if (r.date < range.from || r.date >= range.to) continue;
      const k = monthKey(r.date);
      if (sums.has(k)) sums.set(k, (sums.get(k) ?? 0) + r.distanceKm);
    }
    return months.map((m) => ({
      label: monthBucketLabel(m, range.type),
      distanceKm: sums.get(monthKey(m)) ?? 0,
    }));
  }

  const days = listDaysInRange(range);
  const sums = new Map<string, number>();
  for (const d of days) sums.set(dayKey(d), 0);
  for (const r of rows) {
    if (r.date < range.from || r.date >= range.to) continue;
    const k = dayKey(r.date);
    if (sums.has(k)) sums.set(k, (sums.get(k) ?? 0) + r.distanceKm);
  }
  return days.map((d) => ({
    label: dayBucketLabel(d, range.type),
    distanceKm: sums.get(dayKey(d)) ?? 0,
  }));
}

/// 折れ線用ポイント。週/月 → 計測日のみ、年/すべて → 月平均
export function bucketBodies(
  rows: BodyLike[],
  range: RangeContext,
): BodyBucket[] {
  const isMonthly = range.type === "year" || range.type === "all";

  if (isMonthly) {
    const months = listMonthsInRange(range);
    const groups = new Map<string, { weight: number[]; fat: number[] }>();
    for (const m of months) groups.set(monthKey(m), { weight: [], fat: [] });
    for (const r of rows) {
      if (r.date < range.from || r.date >= range.to) continue;
      const k = monthKey(r.date);
      const g = groups.get(k);
      if (!g) continue;
      g.weight.push(r.weightKg);
      g.fat.push(r.bodyFatPct);
    }
    const out: BodyBucket[] = [];
    for (const m of months) {
      const g = groups.get(monthKey(m));
      if (!g || g.weight.length === 0) continue;
      out.push({
        label: monthBucketLabel(m, range.type),
        weightKg: average(g.weight),
        bodyFatPct: average(g.fat),
      });
    }
    return out;
  }

  // 計測日そのまま (欠損日はスキップ → 線が次の点へ直結する)
  return rows
    .filter((r) => r.date >= range.from && r.date < range.to)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((r) => ({
      label: dayBucketLabel(r.date, range.type),
      weightKg: r.weightKg,
      bodyFatPct: r.bodyFatPct,
    }));
}

/// 既存 summarizeWorkouts に平均ペースを足したもの
export function getMetrics(
  rows: WorkoutLike[],
  range: RangeContext,
): WorkoutMetrics {
  const summary = summarizeWorkouts(rows, { from: range.from, to: range.to });
  const avgPaceSecPerKm =
    summary.distanceKm > 0
      ? Math.round(summary.durationSec / summary.distanceKm)
      : null;
  return { ...summary, avgPaceSecPerKm };
}
