"use server";

import { revalidatePath } from "next/cache";
import { prisma, safeDb } from "@/lib/db";

export type DeleteResult = { kind: "ok" } | { kind: "error"; error: string };

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
  return { kind: "ok" };
}
