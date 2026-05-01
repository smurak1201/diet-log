"use server";

// /body の Server Action — 体組成記録を削除する

import { revalidatePath } from "next/cache";
import type { DeleteResult } from "@/components/delete-confirm-dialog";
import { prisma, safeDb } from "@/lib/db";

export async function deleteBodyComposition(id: string): Promise<DeleteResult> {
  // TODO: 認証導入後に session チェックを追加
  const result = await safeDb(
    () => prisma.bodyComposition.delete({ where: { id } }),
    "deleteBodyComposition",
  );
  if (!result.ok) {
    return { kind: "error", error: result.error };
  }
  revalidatePath("/body");
  // ダッシュボードの体組成カード / 進捗カードにも反映させる
  revalidatePath("/");
  return { kind: "ok" };
}
