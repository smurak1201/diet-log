"use server";

// /workout の Server Action — 運動記録を削除する

import { revalidatePath } from "next/cache";
import type { DeleteResult } from "@/components/delete-confirm-dialog";
import { prisma, safeDb } from "@/lib/db";

export async function deleteWorkout(id: string): Promise<DeleteResult> {
  // TODO: 認証導入後に session チェックを追加
  const result = await safeDb(
    () => prisma.workout.delete({ where: { id } }),
    "deleteWorkout",
  );
  if (!result.ok) {
    return { kind: "error", error: result.error };
  }
  revalidatePath("/workout");
  // ダッシュボードの運動カードにも反映させる
  revalidatePath("/");
  return { kind: "ok" };
}
