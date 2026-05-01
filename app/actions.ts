"use server";

// ダッシュボード (/) で使う Server Action — ダイエット開始日を upsert する

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, safeDb } from "@/lib/db";
import { SETTING_KEYS } from "@/lib/settings";

export type SettingActionState =
  | { kind: "idle" }
  | { kind: "ok" }
  | { kind: "error"; error: string; fieldErrors?: Record<string, string[]> };

const dietStartDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が不正です"),
});

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message];
  }
  return fieldErrors;
}

// 入力日付 (YYYY-MM-DD) が今日 (UTC) より未来かを判定
function isFutureDate(input: string, today: Date): boolean {
  const inputUtc = new Date(`${input}T00:00:00Z`).getTime();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return inputUtc > todayUtc;
}

export async function setDietStartDate(
  _prevState: SettingActionState,
  formData: FormData,
): Promise<SettingActionState> {
  // TODO: 認証導入後に session チェックを追加
  const parsed = dietStartDateSchema.safeParse({
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return {
      kind: "error",
      error: "入力値を確認してください",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  if (isFutureDate(parsed.data.date, new Date())) {
    return {
      kind: "error",
      error: "未来の日付は設定できません",
      fieldErrors: { date: ["未来の日付は設定できません"] },
    };
  }

  const result = await safeDb(
    () =>
      prisma.setting.upsert({
        where: { key: SETTING_KEYS.dietStartDate },
        create: {
          key: SETTING_KEYS.dietStartDate,
          value: parsed.data.date,
        },
        update: { value: parsed.data.date },
      }),
    "setDietStartDate",
  );

  if (!result.ok) {
    return { kind: "error", error: result.error };
  }

  revalidatePath("/");
  return { kind: "ok" };
}
