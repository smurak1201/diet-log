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
  return `あなたは Nike Run Club の結果画面スクリーンショット (日本語 UI) から走行データを抽出するアシスタントです。
画像に実際に写っている数値だけを読み取り、指定された JSON スキーマで返してください。
重要: この指示文に含まれる数値・記号・例示は形式の説明にすぎません。出力の値としては使わず、必ず画像から読み取った値だけを返してください。

参考: 現在日時 (Asia/Tokyo) = ${nowLocal}

抽出項目:
- date: 画面に表示された日時を ISO 8601 のローカル時刻 "YYYY-MM-DDTHH:mm" に変換 (タイムゾーンは付けない)
  - 必ず現在日時より過去の日付になる (記録済みアクティビティの表示のため未来日付はあり得ない)
  - "今日 - HH:mm" → 現在日時の日付の HH:mm
  - "昨日 - HH:mm" → 現在日時の前日の HH:mm
  - "N日前 - HH:mm" → 現在日時から N 日前の HH:mm
  - 曜日表記 (例: 月曜日 / 火曜日 / 木曜日 など) "<曜日> - HH:mm" → 現在日付より前の直近のその曜日。今日と同じ曜日なら 7 日前
  - "<月>月<日>日 (曜) - HH:mm" → 現在年のその月日 HH:mm (現在日付より未来になるなら前年に)
- distanceKm: 「KM」ラベル付近の数値 (km、小数可)
- paceSecPerKm: 「平均ペース」ラベル付近の数値。"M'SS''" 形式や "M:SS" 形式は M*60+SS の秒数に変換して整数で
- durationSec: 「時間」ラベル付近の数値。"MM:SS" は MM*60+SS、"H:MM:SS" は H*3600+MM*60+SS の秒数に変換して整数で
- calories: 「消費カロリー」ラベル付近の整数 (kcal)
- avgHeartRate: 「平均心拍数」ラベル付近の整数 (bpm)。心拍が表示されないアクティビティでは null

無視する要素: 高低差 / テンポ / 標高 / 地図 / 場所名 / アクティビティタイトル (「木曜日 ラン」のような自動生成名) / アイコン
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
  if (process.env.NODE_ENV !== "production") {
    console.log("[gemini] raw response:", text);
  }
  return JSON.parse(text) as RunRecognition;
}
