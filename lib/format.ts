// 表示用フォーマッター (Server / Client 両用、純粋関数)
//
// 日付は UTC ベースで読む:
// - body の date は "YYYY-MM-DDT00:00:00Z" として保存
// - workout の date は datetime-local 文字列に "Z" 無しで `new Date()` パースされ、
//   サーバー (Vercel = UTC) のローカル時として保存 = UTC 値と壁時計が一致
// 環境のタイムゾーンに表示が左右されないよう UTC ゲッターで読む。

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/// JST における「今日」を、その日の 0:00 UTC を表す Date として返す。
/// サーバーは UTC 動作なので、`new Date()` をそのまま使うと JST 早朝 (0:00〜9:00) に
/// 開いたときに前日扱いになり、今週 / 今月の判定が 1 単位ずれる。これを避けるための補正。
export function getJstToday(): Date {
  const jstNow = new Date(Date.now() + JST_OFFSET_MS);
  return new Date(
    Date.UTC(
      jstNow.getUTCFullYear(),
      jstNow.getUTCMonth(),
      jstNow.getUTCDate(),
    ),
  );
}

export function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export function formatDateTime(d: Date): string {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(d)} ${hh}:${mm}`;
}

export function formatPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/// チャート用の短縮日付ラベル ("MM/DD" / UTC ベース)
export function formatChartDate(d: Date): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${m}/${day}`;
}

/// type=date / value 互換の "YYYY-MM-DD" (UTC ベース)
export function formatIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
