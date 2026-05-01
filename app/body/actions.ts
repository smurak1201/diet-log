"use server";

import { revalidatePath } from "next/cache";
import { prisma, safeDb } from "@/lib/db";

export type DeleteResult = { kind: "ok" } | { kind: "error"; error: string };

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
  return { kind: "ok" };
}
