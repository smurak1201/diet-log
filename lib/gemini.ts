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

const PROMPT = `あなたは Nike Run Club の結果画面スクリーンショットから走行データを抽出するアシスタントです。
画像から下記項目を読み取り、指定された JSON スキーマで返してください。

- date: 表示された日時を ISO 8601 のローカル時刻 (例 "2026-05-01T07:30") に。タイムゾーンは付けない
- distanceKm: 走行距離 (km)
- paceSecPerKm: 平均ペース (秒/km)。"5'30''/km" → 330、"5:30/km" → 330
- durationSec: 合計時間 (秒)。"32:10" → 1930、"1:05:30" → 3930
- calories: 消費カロリー (kcal、整数)
- avgHeartRate: 平均心拍数 (bpm、整数)

読み取れない項目は null を返す。値を推測しない。`;

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
): Promise<RunRecognition> {
  const response = await genAI.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: PROMPT },
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
