"use server";

// /entry の Server Actions
// - recognizeWorkoutImage: Nike Run Club のスクショから走行データを抽出 (Gemini)
// - createWorkout: 運動記録を作成
// - upsertBodyComposition: 体組成記録を upsert (date 一意)

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, safeDb } from "@/lib/db";
import { recognizeRunImage, type RunRecognition } from "@/lib/gemini";

// 共通の Action 戻り型 (useActionState で扱う)
export type ActionState =
  | { kind: "idle" }
  | { kind: "ok"; mode?: "created" | "updated" }
  | { kind: "error"; error: string; fieldErrors?: Record<string, string[]> };

export type RecognizeState =
  | { kind: "idle" }
  | { kind: "ok"; data: RunRecognition }
  | { kind: "error"; error: string };

// ---- バリデーションスキーマ -------------------------------------------------

// "mm:ss" → 秒に変換 (例: "5:30" → 330)
const paceSchema = z
  .string()
  .regex(/^\d{1,2}:[0-5]\d$/, "ペースは mm:ss 形式で入力してください")
  .transform((v) => {
    const [m, s] = v.split(":").map(Number);
    return m * 60 + s;
  });

// "mm:ss" または "hh:mm:ss" → 秒に変換
const durationSchema = z
  .string()
  .regex(
    /^(?:\d{1,2}:)?\d{1,2}:[0-5]\d$/,
    "時間は mm:ss または hh:mm:ss 形式で入力してください",
  )
  .transform((v) => {
    const parts = v.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  });

const workoutSchema = z.object({
  date: z.coerce.date(),
  distanceKm: z.coerce.number().positive("距離は正の数値を入力してください"),
  paceSecPerKm: paceSchema,
  durationSec: durationSchema,
  calories: z.coerce.number().int().positive("カロリーは正の整数を入力してください"),
  avgHeartRate: z.coerce
    .number()
    .int()
    .min(30, "心拍数は 30 以上で入力してください")
    .max(250, "心拍数は 250 以下で入力してください"),
});

const bodySchema = z.object({
  // type=date は "YYYY-MM-DD"。Prisma の @db.Date に揃えるため UTC 0 時で正規化
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が不正です")
    .transform((v) => new Date(`${v}T00:00:00Z`)),
  weightKg: z.coerce.number().positive("体重は正の数値を入力してください"),
  bodyFatPct: z.coerce.number().positive("体脂肪率は正の数値を入力してください"),
  muscleMassKg: z.coerce.number().positive("筋肉量は正の数値を入力してください"),
  visceralFat: z.coerce.number().positive("内臓脂肪は正の数値を入力してください"),
  basalMetabolism: z.coerce
    .number()
    .int()
    .positive("基礎代謝は正の整数を入力してください"),
});

// 画像 MIME ホワイトリスト (iPhone は HEIC/HEIF を吐くことがある)
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// ---- ヘルパー --------------------------------------------------------------

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message];
  }
  return fieldErrors;
}

// ---- Actions ---------------------------------------------------------------

export async function recognizeWorkoutImage(
  _prevState: RecognizeState,
  formData: FormData,
): Promise<RecognizeState> {
  // TODO: 認証導入後に session チェックを追加
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { kind: "error", error: "画像が選択されていません" };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { kind: "error", error: "対応していない画像形式です" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { kind: "error", error: "画像サイズが大きすぎます (最大 8MB)" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const recognized = await recognizeRunImage(base64, file.type);
    return { kind: "ok", data: recognized };
  } catch (e) {
    console.error("[recognizeWorkoutImage] failed:", e);
    return { kind: "error", error: "画像認識に失敗しました。手入力で登録してください" };
  }
}

export async function createWorkout(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // TODO: 認証導入後に session チェックを追加
  const parsed = workoutSchema.safeParse({
    date: formData.get("date"),
    distanceKm: formData.get("distanceKm"),
    paceSecPerKm: formData.get("paceSecPerKm"),
    durationSec: formData.get("durationSec"),
    calories: formData.get("calories"),
    avgHeartRate: formData.get("avgHeartRate"),
  });

  if (!parsed.success) {
    return {
      kind: "error",
      error: "入力値を確認してください",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const result = await safeDb(
    () => prisma.workout.create({ data: parsed.data }),
    "createWorkout",
  );

  if (!result.ok) {
    return { kind: "error", error: result.error };
  }

  revalidatePath("/workout");
  return { kind: "ok" };
}

export async function upsertBodyComposition(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // TODO: 認証導入後に session チェックを追加
  const parsed = bodySchema.safeParse({
    date: formData.get("date"),
    weightKg: formData.get("weightKg"),
    bodyFatPct: formData.get("bodyFatPct"),
    muscleMassKg: formData.get("muscleMassKg"),
    visceralFat: formData.get("visceralFat"),
    basalMetabolism: formData.get("basalMetabolism"),
  });

  if (!parsed.success) {
    return {
      kind: "error",
      error: "入力値を確認してください",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { date, ...metrics } = parsed.data;
  const result = await safeDb(async () => {
    const existing = await prisma.bodyComposition.findUnique({
      where: { date },
      select: { id: true },
    });
    await prisma.bodyComposition.upsert({
      where: { date },
      create: { date, ...metrics },
      update: metrics,
    });
    return existing ? "updated" : "created";
  }, "upsertBodyComposition");

  if (!result.ok) {
    return { kind: "error", error: result.error };
  }

  revalidatePath("/body");
  return { kind: "ok", mode: result.data };
}
