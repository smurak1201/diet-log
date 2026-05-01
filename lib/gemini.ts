// Gemini API クライアントのシングルトン + Nike Run Club スクショ認識ヘルパー
// Server Action 専用 (server-only でクライアントへの API キー混入を防ぐ)

import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

const globalForGenAI = globalThis as unknown as {
  genAI: GoogleGenAI | undefined;
};

function createClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }
  return new GoogleGenAI({ apiKey });
}

export const genAI = globalForGenAI.genAI ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForGenAI.genAI = genAI;
}

// 画像入力対応・JSON モード対応・無料枠が広いモデルを採用
const MODEL = "gemini-2.0-flash";

function buildPrompt(nowLocal: string): string {
  return `あなたは Nike Run Club の結果画面スクリーンショットから走行データを抽出するアシスタントです。
画像から下記項目を読み取り、指定された JSON スキーマで返してください。

参考: 現在日時 (Asia/Tokyo) = ${nowLocal}

- date: 表示された日時を ISO 8601 のローカル時刻 "YYYY-MM-DDTHH:mm" に。タイムゾーンは付けない
  - 必ず現在日時より過去の日付になる (Nike Run Club は記録済みのアクティビティを表示するため未来日付はあり得ない)
  - "今日 - 14:56" → 現在日時の日付の 14:56
  - "昨日 - HH:mm" → 現在日時の前日の HH:mm
  - "N日前 - HH:mm" → 現在日時から N 日前の HH:mm
  - "月曜日 - HH:mm" "火曜日 - HH:mm" 等の曜日表記 → 現在日付より前の直近のその曜日。今日と同じ曜日なら 7 日前
  - "X月Y日 (曜) - HH:mm" → 現在年の X月Y日 HH:mm (現在日付より未来になるなら前年に)
- distanceKm: 走行距離 (km)
- paceSecPerKm: 平均ペース (秒/km)。"10'14''/km" → 614、"5'30''" → 330、"5:30/km" → 330
- durationSec: 合計時間 (秒)。"32:10" → 1930、"59:49" → 3589、"1:05:30" → 3930
- calories: 消費カロリー (kcal、整数)
- avgHeartRate: 平均心拍数 (bpm、整数)。心拍が表示されないアクティビティでは null

高低差・テンポ・標高・地図情報・タイトル文字列は無視する。
読み取れない項目は null を返す。値を推測しない。`;
}

export type RunRecognition = {
  date: string | null;
  distanceKm: number | null;
  paceSecPerKm: number | null;
  durationSec: number | null;
  calories: number | null;
  avgHeartRate: number | null;
};

// Nike Run Club スクショから走行データを抽出する
export async function recognizeRunImage(
  base64: string,
  mimeType: string,
  now: Date = new Date(),
): Promise<RunRecognition> {
  // Asia/Tokyo の "YYYY-MM-DD HH:mm (曜)" 形式
  const nowLocal = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).format(now);

  const response = await genAI.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: buildPrompt(nowLocal) },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, nullable: true },
          distanceKm: { type: Type.NUMBER, nullable: true },
          paceSecPerKm: { type: Type.INTEGER, nullable: true },
          durationSec: { type: Type.INTEGER, nullable: true },
          calories: { type: Type.INTEGER, nullable: true },
          avgHeartRate: { type: Type.INTEGER, nullable: true },
        },
        required: [
          "date",
          "distanceKm",
          "paceSecPerKm",
          "durationSec",
          "calories",
          "avgHeartRate",
        ],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini から空のレスポンスが返りました");
  }
  return JSON.parse(text) as RunRecognition;
}
